# Verify local caption export and selected handoff

## Verdict: FAIL

Candidate implementation reviewed: `f04fa05009aaf04e7cbb4440d1326e162c504332` (`v0.1.2`).

Documentation/report commit at review start: `7848a29b18575756f3bee75022880f1fa97dcc0b`.

Live URL: <https://private-caption-export.sociobot.in>

The live JavaScript asset exactly matches a clean build of `7848a29` / the
`f04fa05` implementation. The release tag targets `f04fa05`; `7848a29` is a
later documentation-only commit.

## What was checked

The job is to choose consented local captions and export only the agreed,
accessible excerpt. It is for hearing-impaired professionals and
privacy-conscious teams. On fresh desktop and 390 px phone pages, before
scrolling, the first screen states that job, names that audience, and shows
**Try it with sample data** with its result explained.

- Fresh desktop and phone Chromium contexts loaded the live landing page with
  no console errors. The desktop first action was 44 px high; the phone view
  had no horizontal overflow. Reduced-motion CSS resolved scrolling to `auto`.
- `/opt/fleet/lib/verify-url.sh https://private-caption-export.sociobot.in/ /tmp/pce-live-evidence`
  passed: HTTPS 200, title, `lang=en`, one `h1`, `main`, image alt text, and no
  console errors. Fresh screenshots are in `/tmp/pce-live-evidence/`.
- Standalone `npx @axe-core/cli` could not find this worker's Selenium Chrome
  binary. The allowed pinned Playwright axe integration was run instead on
  `/` and `/demo`; both had zero serious or critical violations.
- Live demo: it opened with five realistic caption spans and three selected;
  its persistent **Demo — sample data, nothing is saved** label survived a
  reload. An edit stayed in `sessionStorage` `demo:pce:project`, never entered
  `localStorage` `pce:project`, and made no external requests. Accessible HTML
  contained selected content and excluded both unselected sample statements.
  Reset restored the sample, and **Start for real** discarded demo storage.
- Invalid/recovery paths worked: absent consent blocked export with a useful
  message; an unmatched search showed its empty state; re-confirming consent
  recovered the action. Empty real workspace, legal routes, visible keyboard
  skip link/focus, and styled not-found page were checked.
- Internal routes `/`, `/demo`, `/workspace`, `/privacy`, `/terms`, and
  `/notices` returned 200 and had a route-specific title, one `h1`, and one
  `main`. Download, mail, and external links had valid destinations; the
  release page and all nine v0.1.2 assets were available.
- Published `SHA256SUMS` matched the downloaded Linux DEB and the installer-
  downloaded AppImage. In isolated temporary consumer paths, both the extracted
  DEB executable and the installed AppImage stayed running for ten seconds
  under Xvfb. The only output was expected headless EGL acceleration warnings.
  No device data or non-product service was accessed.

## Clean-checkout commands

Clean detached worktree: `/tmp/private-caption-export-verify-1` at `7848a29`.
`npm ci` passed. The Rust command initially reported missing GTK development
libraries; after installing the exact Linux prerequisites named in
`.github/workflows/release.yml`, it passed. This is an environment prerequisite,
not a product finding.

- `npm test` — pass: 3 unit tests and 9 Playwright tests.
- `npm run build:site` — pass; output at `dist/site/`. Initial built JS gzip is
  12.08 KiB and CSS gzip is 4.05 KiB.
- `cargo test --manifest-path src-tauri/Cargo.toml` — pass: 1 Rust test.

Every command declared in `.factory/claims.json` was also run exactly as
written and passed:

| Claim | Result |
| --- | --- |
| `caption-import` | pass |
| `local-private` | pass |
| `local-transcription` | pass |
| `offline-workflow` | pass |
| `selected-export` | pass |
| `caption-search` | pass |
| `consent-boundary` | pass |
| `paid-license` | pass |

No earlier review or verification record exists in this repository, so there
are no earlier findings to carry forward.

## Findings

### F-1 — Minor: unknown URLs are successful HTTP responses

`GET /not-a-real-page` returns HTTP 200, although the SPA renders its designed
not-found screen. The site-structure contract requires a real 404 route and,
for Static Web Apps, a 404 response override. Crawlers and integrations cannot
distinguish a missing page from a successful page. Add a real `404.html` and
the configured `responseOverrides["404"]` rewrite/status behavior, then verify
an unknown URL returns HTTP 404 while retaining the existing helpful screen.

### F-2 — Minor: five public privacy claims are absent from claims.json

The claims contract requires a listed, tagged observable test for every public
claim. These distinct public claims have no corresponding entry/test in
`.factory/claims.json`:

1. “No meeting bot. No cloud transcript.”
2. “Audio is not uploaded by this product.”
3. “Raw audio is never added to an export.”
4. “Speaker labels are typed, not identified.”
5. README: “No analytics, third-party fonts, or runtime CDN scripts are used”
   and “Caption content is not sent with either request.”

Some implementation behavior and the existing `local-private` and export
tests support related parts of these statements, but no registered test proves
each advertised outcome. Add one claim and exactly one tagged demo-sandbox
test for each (or reduce the public copy to the already proved scope).

## Counts

- Findings: 2 (0 critical, 0 major, 2 minor)
- Untested public claims: 5

PASS is not permitted because the verification has findings and untested public
claims. The product otherwise exercised the intended local caption selection
and accessible handoff flow successfully.
