import type { Caption, Project } from './types';

export const sampleProject: Project = {
  title: 'Website accessibility review',
  date: '2026-08-28',
  consent: true,
  captions: [
    { id: 'c1', start: 4, end: 12, speaker: 'Maya', text: 'Before we begin, everyone has agreed to local captions for this review.', uncertain: false, selected: false },
    { id: 'c2', start: 18, end: 28, speaker: 'Jon', text: 'The keyboard order works until the export panel. The focus then returns to the page top.', uncertain: false, selected: true },
    { id: 'c3', start: 32, end: 41, speaker: 'Maya', text: 'I will log that as the first fix and add the expected focus target.', uncertain: false, selected: true },
    { id: 'c4', start: 48, end: 58, speaker: 'Speaker unclear', text: 'The status message may also need to announce after the file is ready.', uncertain: true, selected: true },
    { id: 'c5', start: 64, end: 71, speaker: 'Jon', text: 'That covers my feedback. The rest of this discussion stays private.', uncertain: false, selected: false }
  ]
};

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function parseCaptions(input: string): Caption[] {
  const trimmed = input.trim();
  if (!trimmed) return [];
  const blocks = trimmed.replace(/^WEBVTT\s*/i, '').split(/\n\s*\n/);
  const parsed: Caption[] = [];
  const time = /(?:(\d{1,2}):)?(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(?:(\d{1,2}):)?(\d{2}):(\d{2})[,.](\d{3})/;
  for (const block of blocks) {
    const lines = block.split('\n').map(line => line.trim()).filter(Boolean);
    const timeIndex = lines.findIndex(line => time.test(line));
    if (timeIndex < 0) continue;
    const match = lines[timeIndex].match(time);
    if (!match) continue;
    const toSeconds = (h: string | undefined, m: string, s: string, ms: string) => Number(h || 0) * 3600 + Number(m) * 60 + Number(s) + Number(ms) / 1000;
    const raw = lines.slice(timeIndex + 1).join(' ').replace(/<[^>]+>/g, '');
    const speakerMatch = raw.match(/^([^:]{1,30}):\s+(.+)$/);
    parsed.push({
      id: crypto.randomUUID(), start: toSeconds(match[1], match[2], match[3], match[4]),
      end: toSeconds(match[5], match[6], match[7], match[8]), speaker: speakerMatch?.[1] || 'Speaker unclear',
      text: speakerMatch?.[2] || raw, uncertain: !speakerMatch, selected: false
    });
  }
  if (parsed.length) return parsed;
  return trimmed.split(/\n+/).filter(Boolean).map((text, index) => ({
    id: crypto.randomUUID(), start: index * 5, end: index * 5 + 4, speaker: 'Speaker unclear', text, uncertain: true, selected: false
  }));
}

export function exportText(project: Project): string {
  const chosen = project.captions.filter(c => c.selected);
  return `${project.title}\n${project.date}\nConsent to caption: ${project.consent ? 'confirmed' : 'not confirmed'}\n\n${chosen.map(c => `[${formatTime(c.start)}–${formatTime(c.end)}] ${c.speaker}${c.uncertain ? ' (speaker uncertain)' : ''}: ${c.text}${c.uncertain ? ' [check]' : ''}`).join('\n\n')}\n`;
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);

export function exportHtml(project: Project): string {
  const chosen = project.captions.filter(c => c.selected);
  const theme = project.exportTheme || 'paper';
  const colors = theme === 'dark' ? 'color:#eaf7f4;background:#071311' : theme === 'high-contrast' ? 'color:#000;background:#fff' : 'color:#13231f;background:#f5f0e4';
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(project.title)} — caption excerpt</title><style>body{font:18px/1.6 system-ui;max-width:720px;margin:3rem auto;padding:0 1rem;${colors}}time{font:700 15px ui-monospace}li{margin:1.5rem 0}.check{border-bottom:2px dotted currentColor}</style><main><h1>${escapeHtml(project.title)}</h1><p>${escapeHtml(project.date)} · Consent to caption: ${project.consent ? 'confirmed' : 'not confirmed'}</p><h2>Agreed caption excerpt</h2><ol>${chosen.map(c => `<li><time>${formatTime(c.start)}–${formatTime(c.end)}</time><br><strong>${escapeHtml(c.speaker)}${c.uncertain ? ' <span class="check">(speaker uncertain)</span>' : ''}</strong>: ${escapeHtml(c.text)}${c.uncertain ? ' <span class="check">[check]</span>' : ''}</li>`).join('')}</ol><p>Only selected caption spans are included.</p></main></html>`;
}
