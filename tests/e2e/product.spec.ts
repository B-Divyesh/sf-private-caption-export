import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('@claim:local-private demo keeps caption data separate and sends no caption requests', async ({ page }) => {
  const outsideOrigins = new Set<string>();
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.origin !== 'http://127.0.0.1:4173') outsideOrigins.add(url.origin);
  });
  await page.goto('/demo');
  await page.getByLabel('Text for caption 2').fill('Private corrected wording.');
  await page.getByLabel('Text for caption 2').blur();
  const storage = await page.evaluate(() => ({ real: localStorage.getItem('pce:project'), demo: sessionStorage.getItem('demo:pce:project') }));
  expect(storage.real).toBeNull();
  expect(storage.demo).toContain('Private corrected wording.');
  expect([...outsideOrigins]).toEqual([]);
});

test('@claim:no-meeting-bot-or-cloud-transcript demo completes without a remote service request', async ({ page }) => {
  const remoteRequests: string[] = [];
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.origin !== 'http://127.0.0.1:4173') remoteRequests.push(request.url());
  });

  await page.goto('/demo');
  await page.getByLabel('Text for caption 2').fill('Approved local correction.');
  await page.getByLabel('Text for caption 2').blur();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export plain text' }).click();
  await download;

  expect(remoteRequests).toEqual([]);
});

test('@claim:typed-speaker-labels exports the speaker name entered by the reviewer without a remote request', async ({ page }) => {
  const remoteRequests: string[] = [];
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.origin !== 'http://127.0.0.1:4173') remoteRequests.push(request.url());
  });

  await page.goto('/demo');
  await page.getByLabel('Speaker for caption 4').fill('Leah');
  await page.getByLabel('Speaker for caption 4').blur();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export plain text' }).click();
  const path = await (await download).path();
  const text = await import('node:fs/promises').then(fs => fs.readFile(path!, 'utf8'));

  expect(text).toContain('Leah (speaker uncertain)');
  expect(text).not.toContain('Speaker unclear');
  expect(remoteRequests).toEqual([]);
});

test('@claim:no-tracking-or-caption-requests sends no captions to release or license services', async ({ page }) => {
  const remoteRequests: Array<{ url: string; method: string; body: string | null }> = [];
  const captionMarker = 'CAPTION_CONTENT_MUST_STAY_LOCAL';
  await page.addInitScript(marker => {
    localStorage.setItem('pce:project', JSON.stringify({
      title: 'Private meeting', date: '2026-09-06', consent: true,
      captions: [{ id: 'c1', start: 0, end: 3, speaker: 'Reviewer', text: marker, uncertain: false, selected: true }]
    }));
  }, captionMarker);
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.origin !== 'http://127.0.0.1:4173') remoteRequests.push({ url: request.url(), method: request.method(), body: request.postData() });
  });
  await page.route('https://api.github.com/repos/B-Divyesh/sf-private-caption-export/releases/latest', route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ tag_name: 'v0.1.3', html_url: 'https://github.com/B-Divyesh/sf-private-caption-export/releases/tag/v0.1.3', assets: [] })
  }));
  await page.route('https://api.sociobot.in/api/v1/products/private-caption-export/verify?license=local-license', route => route.fulfill({
    contentType: 'application/json', body: JSON.stringify({ valid: false, reason: 'invalid' })
  }));

  await page.goto('/?license=local-license');
  await expect(page.locator('#license-status')).toContainText('License no longer active');
  await expect.poll(() => remoteRequests.length).toBe(2);

  expect(remoteRequests.map(request => request.method)).toEqual(['GET', 'GET']);
  expect(remoteRequests.map(request => request.url)).toEqual([
    'https://api.sociobot.in/api/v1/products/private-caption-export/verify?license=local-license',
    'https://api.github.com/repos/B-Divyesh/sf-private-caption-export/releases/latest'
  ]);
  for (const request of remoteRequests) {
    expect(`${request.url}${request.body || ''}`).not.toContain(captionMarker);
  }
});

test('@claim:offline-workflow editing and export work offline after the first load', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Choose the captions to share');
  await page.getByLabel('Text for caption 2').fill('Offline correction.');
  await page.getByLabel('Text for caption 2').blur();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export plain text' }).click();
  expect((await download).suggestedFilename()).toBe('website-accessibility-review-caption-excerpt.txt');
});

test('@claim:selected-export both export files contain only selected caption spans', async ({ page }) => {
  await page.goto('/demo');
  const htmlDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export accessible HTML' }).click();
  const htmlPath = await (await htmlDownload).path();
  const html = await import('node:fs/promises').then(fs => fs.readFile(htmlPath!, 'utf8'));
  expect(html).toContain('Agreed caption excerpt');
  expect(html).toContain('keyboard order works');
  expect(html).not.toContain('everyone has agreed');
  expect(html).not.toContain('rest of this discussion stays private');
  expect(html).toContain('speaker uncertain');

  const textDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export plain text' }).click();
  const textPath = await (await textDownload).path();
  const text = await import('node:fs/promises').then(fs => fs.readFile(textPath!, 'utf8'));
  expect(text).toContain('Consent to caption: confirmed');
  expect(text).toContain('[check]');
  expect(text).not.toContain('rest of this discussion stays private');

  await page.setContent(html);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter(item => ['critical', 'serious'].includes(item.impact || ''))).toEqual([]);
});

test('@claim:caption-search finds matching caption text and speakers', async ({ page }) => {
  await page.goto('/demo');
  await page.getByLabel('Search captions').fill('status message');
  await expect(page.locator('.caption-row')).toHaveCount(1);
  await expect(page.getByLabel('Text for caption 4')).toContainText('status message');
  await page.getByLabel('Search captions').fill('Jon');
  await expect(page.locator('.caption-row')).toHaveCount(2);
  await page.getByLabel('Search captions').fill('missing phrase');
  await expect(page.getByRole('heading', { name: 'No captions match' })).toBeVisible();
});

test('@claim:consent-boundary blocks transcription and export until consent is confirmed', async ({ page }) => {
  await page.goto('/demo');
  await page.getByLabel('Consent confirmed').uncheck();
  await page.getByRole('button', { name: 'Transcribe audio locally' }).click();
  await expect(page.locator('#route-status')).toHaveText('Transcription did not start. Confirm participant consent first.');
  await expect(page.getByRole('dialog', { name: 'Transcribe with your local model' })).not.toBeVisible();
  await page.getByRole('button', { name: 'Export plain text' }).click();
  await expect(page.locator('#route-status')).toHaveText('No file was exported. Confirm participant consent first.');
  await page.getByLabel('Consent confirmed').check();
  await page.getByRole('button', { name: 'Transcribe audio locally' }).click();
  await expect(page.getByRole('dialog', { name: 'Transcribe with your local model' })).toBeVisible();
});

test('@claim:paid-license shows the fixed price and Sociobot checkout', async ({ page }) => {
  await page.route('https://api.github.com/**', route => route.abort());
  await page.goto('/');
  await expect(page.locator('.price-ticket .amount')).toContainText('$39');
  await expect(page.getByRole('link', { name: 'Buy a desktop license' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/private-caption-export/checkout');
  await page.getByRole('button', { name: 'Have a license? Paste it' }).click();
  await expect(page.getByLabel('License token')).toBeVisible();
  await page.evaluate(() => {
    localStorage.setItem('sb_license:private-caption-export', 'test-license');
    localStorage.setItem('sb_license_verdict:private-caption-export', JSON.stringify({ valid: true, checked: Date.now(), token: 'test-license' }));
  });
  await page.goto('/workspace');
  await expect(page.getByLabel('HTML export theme')).toBeVisible();
  await expect(page.getByLabel('HTML export theme').locator('option')).toHaveCount(3);
});

test('routes, keyboard controls, mobile layout, and accessibility baseline', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main')).toHaveCount(1);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.getByRole('link', { name: 'Privacy', exact: true }).first().click();
  await expect(page).toHaveTitle('Privacy — Private Caption Export');
  await page.goBack();
  await expect(page).toHaveTitle('Private Caption Export — Share agreed captions');

  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter(item => ['critical', 'serious'].includes(item.impact || ''))).toEqual([]);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/demo');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  const demoResults = await new AxeBuilder({ page: page as never }).analyze();
  expect(demoResults.violations.filter(item => ['critical', 'serious'].includes(item.impact || ''))).toEqual([]);
});

test('empty, error, reset, and real workspace states provide a next step', async ({ page }) => {
  await page.goto('/workspace');
  await expect(page.getByRole('heading', { name: 'No captions yet' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Import caption file' }).last()).toBeVisible();
  await page.getByLabel('Consent confirmed').check();
  await page.getByRole('button', { name: 'Export accessible HTML' }).click();
  await expect(page.locator('#route-status')).toHaveText('No file was exported. Select at least one caption first.');
  await page.goto('/demo');
  await page.getByLabel('Include caption 2 in export').uncheck();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByLabel('Include caption 2 in export')).toBeChecked();
  await page.getByRole('link', { name: 'Start for real' }).click();
  expect(await page.evaluate(() => sessionStorage.getItem('demo:pce:project'))).toBeNull();
});

test('every public route has one h1 and a route-specific title', async ({ page }) => {
  const routes = ['/', '/demo', '/workspace', '/privacy', '/terms', '/notices'];
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await page.title()).toMatch(/Private Caption Export/);
  }
});

test('an unknown URL returns HTTP 404 and keeps the helpful not-found page', async ({ page }) => {
  const response = await page.goto('/not-a-real-page');
  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle('Page not found — Private Caption Export');
  await expect(page.getByRole('heading', { name: 'This caption path ends here' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return home' })).toBeVisible();
});
