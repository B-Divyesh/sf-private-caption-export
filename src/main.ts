import './style.css';
import { exportHtml, exportText, formatTime, parseCaptions, sampleProject } from './captions';
import type { Caption, Project } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;
const PRODUCT = 'private-caption-export';
const REAL_KEY = 'pce:project';
const DEMO_KEY = 'demo:pce:project';
let cleanup: (() => void) | undefined;
let initialRoute = true;

function header() {
  return `<header class="site-header"><a class="wordmark" href="/" data-link aria-label="Private Caption Export home"><span class="mark" aria-hidden="true"><i></i><i></i><i></i></span><span>Private Caption Export</span></a><nav aria-label="Main navigation"><a href="/demo" data-link>Demo</a><a href="/workspace" data-link>Workspace</a><a href="/privacy" data-link>Privacy</a><a href="/notices" data-link>Notices</a></nav></header>`;
}

function footer() {
  return `<footer><p>Turn local captions into an agreed handoff.</p><nav aria-label="Footer navigation"><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a><a href="https://www.sociobot.in" rel="external">Built by Param Factory <span class="sr-only">(external site)</span></a></nav><p>v0.1.0 · Generated artwork disclosed in the design notes.</p></footer>`;
}

function shell(content: string) {
  return `${header()}<div id="route-status" class="sr-only" aria-live="polite"></div>${content}${footer()}`;
}

function landing() {
  document.title = 'Private Caption Export — Share agreed captions';
  return shell(`<main id="main">
    <section class="hero">
      <div class="hero-copy"><p class="eyebrow">Local caption workspace · v0.1</p><h1 tabindex="-1">Share only the captions you agree on</h1><p class="lede">For privacy-conscious teams who need searchable meeting captions and a clear, accessible handoff.</p>
      <div class="hero-actions"><a class="button primary" href="/demo" data-link>Try it with sample data</a><span>It opens a finished meeting with three selected spans.</span></div>
      <ul class="facts"><li>Captions stay on this device</li><li>Editing and export work offline</li><li>Free core tools · $39 optional license</li></ul></div>
      <figure class="hero-art"><img src="/caption-lattice.webp" width="768" height="512" fetchpriority="high" alt="A geometric caption timeline where three agreed blocks form a bright path." /><figcaption>Only the bright caption spans enter the handoff.</figcaption></figure>
    </section>
    <section class="preview" aria-labelledby="preview-title"><div><p class="eyebrow">The product itself</p><h2 id="preview-title">Mark the record, not the whole meeting</h2><p>Import a caption file. Correct names and uncertain words. Select only the spans everyone agreed to share.</p></div><div class="mini-timeline" aria-label="Example caption selection"><span><b>00:18</b> Keyboard order issue</span><span class="chosen"><b>00:32</b> Agreed next step</span><span class="chosen"><b>00:48</b> Status announcement</span><span><b>01:04</b> Private discussion</span></div></section>
    <section class="steps" aria-labelledby="steps-title"><p class="eyebrow">How it works</p><h2 id="steps-title">Keep a clear consent boundary</h2><ol><li><div class="step-shot import-shot" aria-hidden="true"><i></i><i></i><i></i></div><b>1 · Import locally</b><span>Open SRT, VTT, or text. The desktop app can run your installed Whisper model.</span></li><li><div class="step-shot check-shot" aria-hidden="true"><i></i><i></i><i></i></div><b>2 · Check the words</b><span>Correct captions and label uncertain speakers before sharing.</span></li><li><div class="step-shot export-shot" aria-hidden="true"><i></i><i></i><i></i></div><b>3 · Export the agreement</b><span>Choose spans and save an accessible HTML or text excerpt.</span></li></ol><p class="walkthrough-note">Three frames show import, review, and the selected handoff.</p></section>
    <section class="boundaries" aria-labelledby="boundaries-title"><div><p class="eyebrow">Privacy boundaries</p><h2 id="boundaries-title">No meeting bot. No cloud transcript.</h2></div><ul><li>Audio is not uploaded by this product.</li><li>Raw audio is never added to an export.</li><li>You confirm consent before caption capture.</li><li>Speaker labels are typed, not identified.</li></ul></section>
    <section class="price" aria-labelledby="price-title"><div><p class="eyebrow">Keep using it</p><h2 id="price-title">Core caption access stays free</h2><p>Import, edit, select, and export captions without paying.</p></div><div class="price-ticket"><p class="amount">$39 <span>one time</span></p><p>The license adds dark and high-contrast HTML export themes. It does not gate accessibility or export.</p><a class="button primary" href="https://api.sociobot.in/api/v1/products/${PRODUCT}/checkout">Buy a desktop license <span class="sr-only">(external site)</span></a><button class="link-button" type="button" data-restore>Have a license? Paste it</button><div id="license-status" class="license-status" aria-live="polite"></div><div id="license-form"></div></div></section>
    <section class="downloads" aria-labelledby="downloads-title"><p class="eyebrow">Desktop app</p><h2 id="downloads-title">Install for your computer</h2><p>The first release is being prepared. Builds are unsigned and may need system approval.</p><div id="download-actions"><a class="button secondary" href="https://github.com/B-Divyesh/sf-private-caption-export/releases">View release downloads <span class="sr-only">(external site)</span></a></div></section>
  </main>`);
}

function policy(kind: 'privacy' | 'terms') {
  const privacy = kind === 'privacy';
  document.title = `${privacy ? 'Privacy' : 'Terms'} — Private Caption Export`;
  return shell(`<main id="main" class="legal"><p class="eyebrow">Plain-language policy</p><h1 tabindex="-1">${privacy ? 'Your captions stay under your control' : 'Use captions with consent'}</h1>${privacy ? `
    <h2>What stays on your device</h2><p>Caption projects and license details use local device storage. Demo projects use a separate demo key and are discarded when you leave.</p>
    <h2>Network use</h2><p>The demo sends no caption text anywhere. License checks send only the license token to Sociobot. The landing page may ask GitHub for release details.</p>
    <h2>Deletion</h2><p>Use Delete project to remove the saved caption project from this browser. Remove license clears the local license token.</p>
    <h2>Contact</h2><p>Email <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a> with privacy questions.</p>` : `
    <h2>Your responsibility</h2><p>Obtain consent before captioning. Recording and transcription laws vary by location.</p>
    <h2>Accuracy</h2><p>Review captions before sharing them. The product marks uncertain speakers, but it cannot verify identity or meaning.</p>
    <h2>License and refunds</h2><p>The $39 desktop license is a one-time purchase. Sociobot is the merchant of record. A refunded or revoked license stops paid extras.</p>
    <h2>No warranty</h2><p>The software is provided under the MIT License without warranty. Do not use it as the only record for safety-critical decisions.</p>`}</main>`);
}

function notices() {
  document.title = 'Notices — Private Caption Export';
  return shell(`<main id="main" class="legal"><p class="eyebrow">Software notices</p><h1 tabindex="-1">Know what runs on your device</h1>
    <h2>Private Caption Export</h2><p>The app is available under the MIT License. The full license text ships with the source code and release.</p>
    <h2>Local transcription</h2><p>Audio transcription uses a separate whisper.cpp installation and model that you choose. Those files do not ship in this repository.</p>
    <h2>Model licenses</h2><p>Check the license for your chosen Whisper model before workplace use. Model authors may set different terms.</p>
    <h2>Generated artwork</h2><p>The caption lattice is original artwork generated for this product with the factory image model on August 28, 2026.</p>
  </main>`);
}

function notFound() {
  document.title = 'Page not found — Private Caption Export';
  return shell(`<main id="main" class="not-found"><div class="broken-path" aria-hidden="true"><i></i><i></i><i></i></div><p class="eyebrow">404 · path not selected</p><h1 tabindex="-1">This caption path ends here</h1><p>The page does not exist. Your saved captions have not changed.</p><a class="button primary" href="/" data-link>Return home</a></main>`);
}

function projectKey(demo: boolean) { return demo ? DEMO_KEY : REAL_KEY; }

function hasActiveLicense() {
  try {
    const token = localStorage.getItem(`sb_license:${PRODUCT}`);
    const verdict = JSON.parse(localStorage.getItem(`sb_license_verdict:${PRODUCT}`) || 'null') as { valid?: boolean; token?: string } | null;
    return Boolean(token && verdict?.valid && verdict.token === token);
  } catch { return false; }
}

function loadProject(demo: boolean): Project {
  try {
    const saved = demo ? sessionStorage.getItem(DEMO_KEY) : localStorage.getItem(REAL_KEY);
    if (saved) return JSON.parse(saved) as Project;
  } catch {
    announce('The saved project could not be read. A new local project is open.');
  }
  return demo ? structuredClone(sampleProject) : { title: 'Untitled caption project', date: new Date().toISOString().slice(0, 10), consent: false, captions: [] };
}

function saveProject(project: Project, demo: boolean) {
  try {
    const value = JSON.stringify(project);
    demo ? sessionStorage.setItem(projectKey(demo), value) : localStorage.setItem(projectKey(demo), value);
  } catch {
    announce('The project could not be saved. Free device storage and try again.');
  }
}

function workspace(demo: boolean) {
  document.title = `${demo ? 'Demo' : 'Workspace'} — Private Caption Export`;
  const paid = hasActiveLicense();
  return shell(`<main id="main" class="workspace-main">${demo ? `<aside class="demo-banner" aria-label="Demo mode"><span><b>Demo</b> — sample data, nothing is saved</span><button type="button" data-reset-demo>Reset demo</button><a href="/workspace" data-link data-start-real>Start for real</a></aside>` : ''}
    <section class="workspace-head"><div><p class="eyebrow">${demo ? 'Sample meeting' : 'Local workspace'}</p><h1 tabindex="-1">Choose the captions to share</h1><p>Check consent, correct the text, then select only agreed spans.</p><label class="project-title">Project name<input id="project-title" value="" maxlength="100" /></label></div><div class="consent-control"><label><input id="consent" type="checkbox" aria-describedby="consent-help" /> Consent confirmed</label><span id="consent-help">Confirm that participants agreed to captions.</span></div></section>
    <section class="workbench" aria-label="Caption workspace">
      <div class="transcript-pane"><div class="toolbar"><button type="button" data-import>Import caption file</button><button type="button" data-add>Add caption</button><button type="button" data-audio>Transcribe audio locally</button><label class="caption-search">Search captions<input id="caption-search" type="search" autocomplete="off" /></label><input id="caption-file" type="file" accept=".srt,.vtt,.txt,text/plain" hidden /></div><p id="transcription-status" class="transcription-status" aria-live="polite"></p><div id="caption-list"></div></div>
      <aside class="export-pane"><p class="eyebrow">Handoff</p><h2>Selected excerpt</h2><p id="selection-count" aria-live="polite"></p><div id="export-preview"></div>${paid ? `<label class="theme-picker">HTML export theme<select id="export-theme"><option value="paper">Warm paper</option><option value="dark">Dark room</option><option value="high-contrast">High contrast</option></select></label>` : `<p class="fine">Warm paper is included. A license adds dark and high-contrast HTML themes.</p>`}<div class="export-actions"><button class="primary" type="button" data-export="html">Export accessible HTML</button><button type="button" data-export="txt">Export plain text</button></div><p class="fine">Only checked spans enter either file. Audio never enters an export.</p></aside>
    </section>
    ${demo ? '' : `<section class="danger-zone" aria-labelledby="project-controls"><h2 id="project-controls">Project controls</h2><p>Saved projects stay in this device profile.</p><button type="button" data-delete>Delete this project</button></section>`}
    <dialog id="editor-dialog" aria-labelledby="editor-title"><form method="dialog"><h2 id="editor-title">Add a caption</h2><label>Speaker name<input name="speaker" value="Speaker unclear" /></label><label>Caption text<textarea name="text" required></textarea></label><label>Start time in seconds<input name="start" type="number" min="0" value="0" /></label><label><input name="uncertain" type="checkbox" checked /> Mark speaker as uncertain</label><div class="dialog-actions"><button value="cancel">Cancel</button><button class="primary" value="save">Add caption</button></div></form></dialog>
    <dialog id="audio-dialog" aria-labelledby="audio-title"><form method="dialog"><h2 id="audio-title">Transcribe with your local model</h2><p>The desktop app runs an installed <code>whisper-cli</code> command. No audio is uploaded.</p><label>Whisper model path<input name="model" placeholder="/path/to/ggml-base.en.bin" /></label><button type="button" data-pick-audio>Choose WAV audio</button><p id="audio-file-name">No audio chosen.</p><div class="dialog-actions"><button value="cancel">Cancel</button><button class="primary" value="transcribe">Start local transcription</button></div></form></dialog>
    <dialog id="confirm-dialog" aria-labelledby="confirm-title"><form method="dialog"><h2 id="confirm-title">Delete this caption project?</h2><p>This removes the transcript and selections from this device. It cannot be undone.</p><div class="dialog-actions"><button value="cancel">Keep project</button><button class="danger" value="delete">Delete project</button></div></form></dialog>
  </main>`);
}

function bindWorkspace(demo: boolean) {
  let project = loadProject(demo);
  let pickedAudio = '';
  let searchQuery = '';
  const list = document.querySelector<HTMLDivElement>('#caption-list')!;
  const preview = document.querySelector<HTMLDivElement>('#export-preview')!;
  const consent = document.querySelector<HTMLInputElement>('#consent')!;
  const projectTitle = document.querySelector<HTMLInputElement>('#project-title')!;
  consent.checked = project.consent;
  projectTitle.value = project.title;
  const exportTheme = document.querySelector<HTMLSelectElement>('#export-theme');
  if (exportTheme) exportTheme.value = project.exportTheme || 'paper';

  const persist = () => saveProject(project, demo);
  const render = () => {
    if (!project.captions.length) {
      list.innerHTML = `<div class="empty"><div class="empty-geometry" aria-hidden="true"></div><h2>No captions yet</h2><p>Import an SRT, VTT, or text file. You can also add a caption by hand.</p><button type="button" data-empty-import>Import caption file</button></div>`;
    } else {
      const matches = project.captions
        .map((caption, index) => ({ caption, index }))
        .filter(({ caption }) => `${caption.speaker} ${caption.text}`.toLocaleLowerCase().includes(searchQuery));
      list.innerHTML = matches.length ? `<ol class="caption-list">${matches.map(({ caption: c, index }) => `<li class="caption-row ${c.selected ? 'selected' : ''}"><label class="caption-check"><input type="checkbox" data-select="${c.id}" ${c.selected ? 'checked' : ''}/><span class="sr-only">Include caption ${index + 1} in export</span></label><time>${formatTime(c.start)}</time><div><label class="speaker-label">Speaker<input data-speaker="${c.id}" value="${escapeAttr(c.speaker)}" aria-label="Speaker for caption ${index + 1}" /></label><textarea data-text="${c.id}" aria-label="Text for caption ${index + 1}">${escapeText(c.text)}</textarea>${c.uncertain ? '<span class="uncertain">check speaker and words</span>' : ''}</div><button class="remove-caption" data-remove="${c.id}" aria-label="Remove caption ${index + 1}">Remove</button></li>`).join('')}</ol>` : `<div class="empty search-empty"><h2>No captions match</h2><p>Clear the search or try a speaker name.</p></div>`;
    }
    const chosen = project.captions.filter(c => c.selected);
    document.querySelector('#selection-count')!.textContent = `${chosen.length} of ${project.captions.length} caption spans selected.`;
    preview.innerHTML = chosen.length ? chosen.map(c => `<article><time>${formatTime(c.start)}–${formatTime(c.end)}</time><b>${escapeText(c.speaker)}${c.uncertain ? ' · speaker uncertain' : ''}</b><p>${escapeText(c.text)}</p></article>`).join('') : `<div class="preview-empty"><p>No spans selected.</p><span>Check a caption to add it here.</span></div>`;
  };

  const file = document.querySelector<HTMLInputElement>('#caption-file')!;
  const search = document.querySelector<HTMLInputElement>('#caption-search')!;
  search.addEventListener('input', () => { searchQuery = search.value.trim().toLocaleLowerCase(); render(); });
  const importFile = () => file.click();
  document.querySelector('[data-import]')?.addEventListener('click', importFile);
  document.querySelector('[data-empty-import]')?.addEventListener('click', importFile);
  file.addEventListener('change', async () => {
    const selected = file.files?.[0];
    if (!selected) return;
    try {
      const captions = parseCaptions(await selected.text());
      if (!captions.length) return announce('No captions were found. Choose an SRT, VTT, or text file.');
      project.captions.push(...captions); persist(); render(); announce(`${captions.length} captions imported.`);
    } catch {
      announce('The caption file could not be read. Choose another local file.');
    }
  });
  consent.addEventListener('change', () => { project.consent = consent.checked; persist(); announce(consent.checked ? 'Consent confirmed.' : 'Consent confirmation removed.'); });
  projectTitle.addEventListener('change', () => { project.title = projectTitle.value.trim() || 'Untitled caption project'; projectTitle.value = project.title; persist(); announce('Project name saved on this device.'); });
  exportTheme?.addEventListener('change', () => { project.exportTheme = exportTheme.value as Project['exportTheme']; persist(); announce('HTML export theme saved.'); });
  list.addEventListener('change', event => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const id = target.dataset.select || target.dataset.speaker || target.dataset.text;
    const caption = project.captions.find(c => c.id === id);
    if (!caption) return;
    if (target.dataset.select) caption.selected = (target as HTMLInputElement).checked;
    if (target.dataset.speaker) caption.speaker = target.value;
    if (target.dataset.text) caption.text = target.value;
    persist(); render();
  });
  list.addEventListener('click', event => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-remove]');
    if (!target) return;
    project.captions = project.captions.filter(c => c.id !== target.dataset.remove); persist(); render(); announce('Caption removed.');
  });

  const editor = document.querySelector<HTMLDialogElement>('#editor-dialog')!;
  document.querySelector('[data-add]')?.addEventListener('click', () => editor.showModal());
  editor.addEventListener('close', () => {
    if (editor.returnValue !== 'save') return;
    const data = new FormData(editor.querySelector('form')!);
    const text = String(data.get('text') || '').trim(); if (!text) return;
    const start = Number(data.get('start') || 0);
    project.captions.push({ id: crypto.randomUUID(), start, end: start + 5, speaker: String(data.get('speaker') || 'Speaker unclear'), text, uncertain: data.has('uncertain'), selected: false });
    persist(); render(); (editor.querySelector('form') as HTMLFormElement).reset(); announce('Caption added.');
  });

  const audioDialog = document.querySelector<HTMLDialogElement>('#audio-dialog')!;
  const audioButton = document.querySelector<HTMLButtonElement>('[data-audio]')!;
  const transcriptionStatus = document.querySelector<HTMLParagraphElement>('#transcription-status')!;
  audioButton.addEventListener('click', () => {
    if (!project.consent) return announce('Transcription did not start. Confirm participant consent first.');
    audioDialog.showModal();
  });
  document.querySelector('[data-pick-audio]')?.addEventListener('click', async () => {
    try {
      if (!(window as unknown as { __TAURI_INTERNALS__?: object }).__TAURI_INTERNALS__) throw new Error('desktop');
      const { open } = await import('@tauri-apps/plugin-dialog');
      const path = await open({ multiple: false, filters: [{ name: 'WAV audio', extensions: ['wav'] }] });
      if (typeof path === 'string') { pickedAudio = path; document.querySelector('#audio-file-name')!.textContent = path.split(/[\\/]/).pop() || path; }
    } catch { announce('Local audio transcription is available in the desktop app.'); }
  });
  audioDialog.addEventListener('close', async () => {
    if (audioDialog.returnValue !== 'transcribe') return;
    const model = String(new FormData(audioDialog.querySelector('form')!).get('model') || '');
    if (!pickedAudio || !model) return announce('Choose a WAV file and enter your local model path.');
    audioButton.disabled = true;
    transcriptionStatus.textContent = 'Transcribing locally. Keep the app open.';
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const srt = await invoke<string>('transcribe_audio', { audioPath: pickedAudio, modelPath: model });
      const captions = parseCaptions(srt); project.captions.push(...captions); persist(); render(); transcriptionStatus.textContent = `${captions.length} local captions added.`; announce(transcriptionStatus.textContent);
    } catch (error) { transcriptionStatus.textContent = `Transcription did not finish. ${String(error)} Check whisper-cli and the model path.`; announce(transcriptionStatus.textContent); }
    finally { audioButton.disabled = false; }
  });

  document.querySelectorAll<HTMLButtonElement>('[data-export]').forEach(button => button.addEventListener('click', () => {
    if (!project.consent) return announce('No file was exported. Confirm participant consent first.');
    const chosen = project.captions.filter(c => c.selected);
    if (!chosen.length) return announce('No file was exported. Select at least one caption first.');
    const html = button.dataset.export === 'html';
    download(html ? exportHtml(project) : exportText(project), `${slug(project.title)}-caption-excerpt.${html ? 'html' : 'txt'}`, html ? 'text/html' : 'text/plain');
    announce(`${html ? 'Accessible HTML' : 'Plain text'} exported with ${chosen.length} caption spans.`);
  }));
  const confirm = document.querySelector<HTMLDialogElement>('#confirm-dialog')!;
  document.querySelector('[data-delete]')?.addEventListener('click', () => confirm.showModal());
  confirm.addEventListener('close', () => { if (confirm.returnValue === 'delete') { demo ? sessionStorage.removeItem(DEMO_KEY) : localStorage.removeItem(REAL_KEY); project = loadProject(demo); consent.checked = project.consent; projectTitle.value = project.title; render(); announce('Caption project deleted from this device.'); } });
  document.querySelector('[data-reset-demo]')?.addEventListener('click', () => { sessionStorage.removeItem(DEMO_KEY); project = structuredClone(sampleProject); consent.checked = true; projectTitle.value = project.title; if (exportTheme) exportTheme.value = project.exportTheme || 'paper'; search.value = ''; searchQuery = ''; render(); announce('Demo reset.'); });
  render();
}

function escapeText(value: string) { const span = document.createElement('span'); span.textContent = value; return span.innerHTML; }
function escapeAttr(value: string) { return escapeText(value).replace(/"/g, '&quot;'); }
function slug(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function download(content: string, name: string, type: string) { const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([content], { type })); link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000); }
function announce(message: string) { const region = document.querySelector('#route-status'); if (region) region.textContent = message; }

async function handleLicense() {
  const params = new URLSearchParams(location.search);
  const incoming = params.get('license');
  if (incoming) {
    localStorage.setItem(`sb_license:${PRODUCT}`, incoming);
    localStorage.removeItem(`sb_license_verdict:${PRODUCT}`);
    params.delete('license');
    history.replaceState({}, '', `${location.pathname}${params.size ? `?${params}` : ''}`);
  }
  const token = localStorage.getItem(`sb_license:${PRODUCT}`);
  const status = document.querySelector<HTMLDivElement>('#license-status');
  let cached: { valid: boolean; checked: number; token?: string } | null = null;
  try { cached = JSON.parse(localStorage.getItem(`sb_license_verdict:${PRODUCT}`) || 'null'); } catch { localStorage.removeItem(`sb_license_verdict:${PRODUCT}`); }
  const showStatus = (valid: boolean | null) => {
    if (!status || !token) return;
    status.innerHTML = `${valid === null ? 'Checking the saved license.' : valid ? 'License active on this device.' : 'License no longer active. Buy a new license or paste another token.'} <button type="button" data-remove-license>Remove license</button>`;
    status.querySelector('[data-remove-license]')?.addEventListener('click', () => {
      localStorage.removeItem(`sb_license:${PRODUCT}`);
      localStorage.removeItem(`sb_license_verdict:${PRODUCT}`);
      status.textContent = 'License removed from this device.';
    });
  };
  const currentCached = Boolean(token && cached?.token === token);
  if (token) showStatus(currentCached ? Boolean(cached?.valid) : null);
  if (token && (!currentCached || !cached || Date.now() - cached.checked > 86_400_000)) {
    fetch(`https://api.sociobot.in/api/v1/products/${PRODUCT}/verify?license=${encodeURIComponent(token)}`)
      .then(response => { if (!response.ok) throw new Error('verify'); return response.json(); })
      .then(result => {
        const valid = Boolean(result.valid);
        localStorage.setItem(`sb_license_verdict:${PRODUCT}`, JSON.stringify({ valid, checked: Date.now(), token }));
        showStatus(valid);
      })
      .catch(() => { if (status) status.textContent = 'The license could not be checked. Try again when online.'; });
  }
  document.querySelector('[data-restore]')?.addEventListener('click', () => {
    const target = document.querySelector<HTMLDivElement>('#license-form')!;
    target.innerHTML = `<form class="restore-form"><label>License token<input name="license" required autocomplete="off" /></label><button type="submit">Verify license</button><p aria-live="polite"></p></form>`;
    target.querySelector('input')?.focus();
    target.querySelector('form')?.addEventListener('submit', async event => { event.preventDefault(); const token = String(new FormData(event.currentTarget as HTMLFormElement).get('license')).trim(); localStorage.setItem(`sb_license:${PRODUCT}`, token); localStorage.removeItem(`sb_license_verdict:${PRODUCT}`); const formStatus = target.querySelector('p')!; formStatus.textContent = 'Checking license…'; try { const response = await fetch(`https://api.sociobot.in/api/v1/products/${PRODUCT}/verify?license=${encodeURIComponent(token)}`); if (!response.ok) throw new Error('verify'); const result = await response.json(); formStatus.textContent = result.valid ? 'License active on this device.' : 'License not active. Check the token or buy a license.'; localStorage.setItem(`sb_license_verdict:${PRODUCT}`, JSON.stringify({ valid: Boolean(result.valid), checked: Date.now(), token })); } catch { formStatus.textContent = 'License could not be checked. Try again when online.'; } });
  });
}

async function releaseDownload() {
  const holder = document.querySelector('#download-actions'); if (!holder) return;
  try {
    const cached = localStorage.getItem('pce:release');
    const stored = cached ? JSON.parse(cached) : null;
    const data = stored && Date.now() - stored.time < 3_600_000 ? stored.data : await fetch('https://api.github.com/repos/B-Divyesh/sf-private-caption-export/releases/latest').then(r => { if (!r.ok) throw new Error(); return r.json(); });
    if (!stored) localStorage.setItem('pce:release', JSON.stringify({ time: Date.now(), data }));
    const platform = /Win/.test(navigator.platform) ? 'Windows' : /Mac/.test(navigator.platform) ? 'macOS' : 'Linux';
    const pattern = platform === 'Windows' ? /\.(msi|exe)$/ : platform === 'macOS' ? /\.(dmg|app\.tar\.gz)$/ : /\.(AppImage|deb)$/;
    const asset = data.assets?.find((item: { name: string }) => pattern.test(item.name));
    if (asset) holder.innerHTML = `<a class="button primary" href="${escapeAttr(asset.browser_download_url)}">Download for ${platform}</a><a href="${escapeAttr(data.html_url)}">All releases <span class="sr-only">(external site)</span></a>`;
  } catch { /* calm fallback already rendered */ }
}

function route(fromHistory = false, savedScroll = 0) {
  cleanup?.(); cleanup = undefined;
  let path = location.pathname.replace(/\/$/, '') || '/';
  if ((window as unknown as { __TAURI_INTERNALS__?: object }).__TAURI_INTERNALS__ && path === '/') path = '/workspace';
  if (path === '/') app.innerHTML = landing();
  else if (path === '/demo') app.innerHTML = workspace(true);
  else if (path === '/workspace') app.innerHTML = workspace(false);
  else if (path === '/privacy') app.innerHTML = policy('privacy');
  else if (path === '/terms') app.innerHTML = policy('terms');
  else if (path === '/notices') app.innerHTML = notices();
  else app.innerHTML = notFound();
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) canonical.href = `https://private-caption-export.sociobot.in${path === '/' ? '/' : path}`;
  if (path === '/demo') bindWorkspace(true);
  if (path === '/workspace') bindWorkspace(false);
  if (path === '/') {
    handleLicense();
    if (location.hostname.endsWith('.sociobot.in')) releaseDownload();
  }
  const heading = document.querySelector<HTMLElement>('h1');
  if (!initialRoute) heading?.focus({ preventScroll: true });
  const routeStatus = document.querySelector('#route-status');
  if (routeStatus && heading) routeStatus.textContent = `${heading.textContent || 'Page'} loaded.`;
  initialRoute = false;
  window.scrollTo(0, fromHistory ? savedScroll : 0);
}

document.addEventListener('click', event => {
  const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[data-link]');
  if (!link || link.origin !== location.origin) return;
  event.preventDefault();
  if ((location.pathname.replace(/\/$/, '') || '/') === '/demo' && new URL(link.href).pathname !== '/demo') sessionStorage.removeItem(DEMO_KEY);
  history.replaceState({ ...history.state, scrollY: window.scrollY }, '', location.href);
  history.pushState({}, '', link.href); route();
});
window.addEventListener('popstate', event => route(true, Number(event.state?.scrollY || 0)));
route();

if ('serviceWorker' in navigator && import.meta.env.PROD) navigator.serviceWorker.register('/sw.js').catch(() => undefined);
