# Verify selected local caption export

## Verdict: FAIL

Implementation reviewed: `c306e6e5b0a749e021753d462dcc35a8a3b84bd0` (`v0.1.3`).

Documentation/report baseline: `dda1b05611fe634b936987e3f56e459f55541ed2`.

Live URL: <https://private-caption-export.sociobot.in>

The job is to select consented local captions and export only the agreed,
accessible excerpt. It is for hearing-impaired professionals and
privacy-conscious teams. In fresh desktop and 390 px phone browsers, before
scrolling, the first screen states that job, names that audience, and offers
**Try it with sample data**, explaining that it opens a finished meeting with
three selected spans.

## What passed

- Clean detached checkout at `dda1b05`; `npm ci` passed with no reported
  vulnerabilities. The Linux packages documented in
  `.github/workflows/release.yml` (`libwebkit2gtk-4.1-dev`,
  `libappindicator3-dev`, `librsvg2-dev`, and `patchelf`) were installed before
  Rust testing.
- `npm test` passed: 4 unit tests and 13 Playwright tests.
- `cargo test --manifest-path src-tauri/Cargo.toml` passed: 3 Rust tests.
- `npm run build` passed and produced `dist/site/`. Local
  `/opt/fleet/lib/verify-url.sh` passed, and the local unknown route returned
  HTTP 404.
- Every one of the 13 literal commands in `.factory/claims.json` passed from
  the clean checkout. There are no untested registered or public claims found
  in this review.
- On the live site, root and all documented routes returned 200; an unknown
  route returned the deliberate HTTP 404 recovery page. The live root had no
  console errors and `verify-url.sh` passed title, language, main landmark,
  heading, and alternative-text checks.
- Live axe checks on `/`, `/demo`, and the 404 page had zero serious or
  critical violations. The console messages observed while visiting the 404
  page were the browser's expected failed-resource messages for its deliberate
  HTTP 404, not a runtime fault.
- The live demo showed five realistic spans with three selected. A changed
  caption persisted only in `sessionStorage` under `demo:pce:project`, did not
  alter `localStorage` `pce:project`, survived reload with the persistent demo
  label, reset to the shipped sample, and was discarded by **Start for real**.
  Editing and exporting the sample made no remote request.
- Invalid and recovery paths worked: removed consent blocked export with an
  announced next step, a missing search showed its empty state, and real
  workspace opened empty with an import action. Reduced motion resolves scroll
  behavior to `auto`; the skip link receives first keyboard focus.
- The `v0.1.3` GitHub Actions run `34014413023` completed successfully for
  quality, macOS, Windows, Linux, and manifest jobs. `latest.json` is valid
  for all three platforms. The downloaded Linux DEB SHA-256 was
  `5eb1b3b410eacf2a583a9c21cd18b64f93911a249a1b5aa43178f04eb1bae678`,
  matching `SHA256SUMS`; its extracted installed executable remained running
  for eight seconds in a fresh temporary consumer path under Xvfb.

## Prior finding disposition

| Earlier finding | Current disposition | Evidence |
| --- | --- | --- |
| F-1 from `verification-1.md`: unknown URLs returned 200 | Fixed | local and live `/not-a-real-page` returned HTTP 404 with the recovery page |
| F-2 from `verification-1.md`: five privacy claims unregistered | Fixed | all five now have distinct claim records and passed tagged outcome tests |

## Findings

### F-1 — Minor: touch targets fall below the required 44 px minimum

The live 390 px browser exposes navigation and footer links with only their
text-line hit area: **Demo** is 42 x 16 px, **Privacy** 51 x 16 px, and
**Notices** 52 x 16 px. Footer links are likewise 16 px high. The focused skip
link measures 199 x 43 px. Outside the phone-specific media rule, **Reset
demo**, **Start for real**, caption removal, and license removal controls use
36 px minimum heights. This violates the 44 px target requirement, including
for navigation needed to reach privacy and legal pages.

Give every interactive text link and compact control a 44 x 44 px (or larger)
click/tap box while preserving visible labels and spacing. Add a mobile
measurement regression for header and footer links, demo controls, and caption
removal.

### F-2 — Minor: visible headings do not meet the plain-words contract

The landing page heading **“Mark the record, not the whole meeting”** and the
404 heading **“This caption path ends here”** are metaphorical rather than
plain names for their sections or states. The assigned plain-words contract
explicitly disallows metaphor or mood headings. These phrases make the page
less direct for a cold visitor and a screen-reader heading list.

Replace them with direct headings such as **“Select captions to export”** and
**“Page not found”**, then update the relevant route test expectations and the
copy audit.

## Counts

- Findings: 2 (0 critical, 0 major, 2 minor)
- Untested claims: 0

PASS is not permitted while these findings remain. Sociobot billing
registration also remains an operator dependency for successful $39 license
checkout, but it is documented rather than counted as a product defect in the
free workflow.
