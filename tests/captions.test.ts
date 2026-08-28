import { describe, expect, it } from 'vitest';
import { exportHtml, exportText, formatTime, parseCaptions, sampleProject } from '../src/captions';

describe('caption files', () => {
  it('@claim:caption-import parses SRT, VTT, and plain text', () => {
    const srt = `1\n00:00:01,000 --> 00:00:03,500\nMaya: Check the focus order.\n\n2\n00:00:04,000 --> 00:00:06,000\nUnlabeled note`;
    const parsed = parseCaptions(srt);
    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toMatchObject({ speaker: 'Maya', start: 1, end: 3.5, uncertain: false });
    expect(parsed[1]).toMatchObject({ speaker: 'Speaker unclear', uncertain: true });
    expect(parseCaptions('WEBVTT\n\n00:01.000 --> 00:02.000\nHello')).toHaveLength(1);
    expect(parseCaptions('First line\nSecond line')).toHaveLength(2);
  });

  it('formats long timestamps', () => {
    expect(formatTime(65)).toBe('01:05');
    expect(formatTime(3605)).toBe('60:05');
  });

  it('exports only selected captions and escapes HTML', () => {
    const project = structuredClone(sampleProject);
    project.title = '<Review>';
    project.captions[1].text = '<script>alert(1)</script>';
    const html = exportHtml(project);
    const text = exportText(project);
    expect(html).toContain('&lt;Review&gt;');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain(project.captions[0].text);
    expect(text).toContain('speaker uncertain');
    expect(text).not.toContain(project.captions[4].text);
    project.exportTheme = 'high-contrast';
    expect(exportHtml(project)).toContain('color:#000;background:#fff');
  });
});
