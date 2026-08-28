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
  const routes = ['/', '/demo', '/workspace', '/privacy', '/terms', '/notices', '/missing'];
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await page.title()).toMatch(/Private Caption Export/);
  }
});
