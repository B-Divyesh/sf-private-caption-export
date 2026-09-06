# Export selected local captions — repair handoff v0.1.3

## Independent QA update — verification 2

Independent verification of implementation `c306e6e5b0a749e021753d462dcc35a8a3b84bd0` against documentation baseline `dda1b05611fe634b936987e3f56e459f55541ed2` is **FAIL** with two minor findings and zero untested claims. Product code was not changed in this pass.

- All 13 declared claim commands, the full JavaScript and Rust suites, and the static build passed from a clean checkout after the documented Linux desktop prerequisites were installed.
- Fresh live desktop and phone checks confirmed the job, audience, and sample first action before scrolling. The demo is isolated, persistent while in demo, resettable, and discarded on Start for real. Live 404, legal routes, keyboard skip link, reduced motion, privacy request behavior, release manifest, checksum, and a clean Linux consumer launch passed.
- The prior 404-status and unregistered-privacy-claim findings remain fixed.
- Follow-up required: make every link and compact control at least 44 px in both dimensions; replace the landing and 404 metaphorical headings with plain language. See `.factory/verification-2.md` for exact measurements and remediation.

## Release identity

- Implementation SHA: `c306e6e5b0a749e021753d462dcc35a8a3b84bd0`.
- Release tag: `v0.1.3`.
- Documentation at repair start: `4906dd5e18c15717c35c29811c739a274e00380f`.
- Static site: <https://private-caption-export.sociobot.in>.
- Desktop release workflow: <https://github.com/B-Divyesh/sf-private-caption-export/actions/runs/34014413023>.

## Job, audience, and first action

The job is to select consented local captions and export only the agreed, accessible excerpt. It is for hearing-impaired professionals and privacy-conscious teams. The first action is **Try it with sample data**, which opens a finished meeting with three selected spans.

## What changed

- Fixed unknown routes returning HTTP 200. The build now emits static pages for every supported route and a dedicated `404.html`. Static Web Apps excludes unknown paths from the SPA fallback and rewrites real 404 responses to that page.
- Added a browser regression that checks both the HTTP 404 status and the useful recovery screen.
- Registered and tested the five previously unlisted privacy claims: no meeting bot or cloud transcript, local audio transcription, no raw audio in exports, reviewer-typed speaker labels, and no tracking or caption content in release/license requests.
- Added live axe coverage for the demo workspace.
- Fixed a real desktop race: simultaneous local transcriptions could share a millisecond-based temporary filename. Each local transcription now receives a process-local sequence suffix, with a concurrent regression test.
- Bumped the service-worker cache and desktop package to `v0.1.3`, so existing visitors update to the repaired site and new desktop downloads include the race fix.

## Verification

From the documented clean setup, `npm ci` passed. The Linux Tauri packages from `.github/workflows/release.yml` were installed before the Rust check.

- `npm test` passed: 4 unit tests and 13 Playwright tests.
- `cargo test --manifest-path src-tauri/Cargo.toml` passed: 3 Rust tests.
- `npm run build` passed and produced `dist/site/`.
- Every command declared in `.factory/claims.json` was run literally and passed. This includes all 13 current claim commands.
- Local static verification passed with `/opt/fleet/lib/verify-url.sh`: title, language, main landmark, one heading, alt text, and no console errors. The local unknown-route request returned HTTP 404.
- Live verification passed after deployment. The live root returned HTTP 200. `GET /not-a-real-page` returned HTTP 404 and loaded the styled recovery page.
- Fresh desktop and 390 px phone contexts showed the job, audience, first action, and three facts before scrolling. The phone had no horizontal overflow and reduced-motion scrolling was `auto`.
- Live demo checks passed: five realistic caption spans with three selected, the persistent sample label survived reload, an edit stayed in `sessionStorage` under `demo:pce:project`, the real `localStorage` project was unchanged, Reset restored the sample, and Start for real discarded demo storage.
- Live Playwright axe checks on `/`, `/demo`, and the 404 page had no serious or critical violations. Live console checks on the landing page had no errors.
- The static deployment completed successfully against the existing `sf-private-caption-export` app. The live cache name is `private-caption-export-v0.1.3`.
- GitHub Actions quality, macOS, Windows, Linux, and manifest jobs all passed for `v0.1.3`. The release has DMG, macOS archive, MSI, EXE, AppImage, DEB, RPM, `SHA256SUMS`, and `latest.json`.
- `latest.json` is valid for macOS, Windows, and Linux. The downloaded Linux DEB matched `SHA256SUMS` with SHA-256 `5eb1b3b410eacf2a583a9c21cd18b64f93911a249a1b5aa43178f04eb1bae678` and its extracted executable stayed running for eight seconds in a clean temporary consumer path under Xvfb.
- A fresh live Linux browser selected the v0.1.3 AppImage download link with no console errors.

Evidence includes `/work/.evidence/live-post-repair/`, `/work/.evidence/local-post-repair/`, `/work/.evidence/catalog-description.txt`, and `/work/.evidence/billing-offer.json`.

## Prior finding disposition

| Earlier finding | Current disposition | Evidence |
| --- | --- | --- |
| F-1: unknown routes returned HTTP 200 | Fixed | local and live unknown-route checks return HTTP 404; browser test asserts the status and recovery page |
| F-2: five public privacy claims were unregistered | Fixed | five new claim records and outcome-based sandbox checks all pass |

No earlier review or verification record exists before `verification-1.md`.

## Known gaps

- The v0.1 desktop app transcribes a chosen WAV file after capture. It does not stream microphone captions live.
- `whisper-cli` and a Whisper model are not bundled. The user installs the runtime and chooses a compatible local model.
- Project deletion removes the app’s local record. It is not a forensic secure erase of the device profile.
- The $39 one-time license offer still needs Sociobot billing registration. The free import, edit, select, and export flow works without it. No checkout result is treated as entitlement until license verification succeeds.

## Operator action

- Register `private-caption-export` with the Sociobot billing engine at $39 one time and use `https://private-caption-export.sociobot.in/` as the return URL. The exact public offer metadata is in `/work/.evidence/billing-offer.json`.
- Add `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` plus their password secrets before shipping signed desktop builds. v0.1.3 packages are intentionally unsigned.
- Test one packaged app on each supported operating system before a broad release announcement.
