# Private Caption Export v0.1.1 handoff

## What was built

- A Tauri 2 desktop app with a Vite and TypeScript interface.
- Local SRT, VTT, and plain-text caption import.
- Local WAV transcription through an installed `whisper-cli` and user-selected model.
- Consent-gated transcription and export.
- Search across caption text and speaker names.
- Editable speaker labels, visible uncertainty, span selection, and timestamped previews.
- Accessible HTML and plain-text exports containing only selected spans.
- Local project storage, confirmed deletion, and a session-only demo namespace.
- A one-click `/demo` with five realistic caption spans and three selected spans.
- A $39 one-time Sociobot license flow for two optional HTML export themes.
- `/privacy`, `/terms`, `/notices`, and styled 404 routes.
- OS-aware release downloads with a calm pre-release fallback.
- Checksum-verifying shell and PowerShell installers.
- A Tauri release workflow for macOS universal, Windows, and Linux bundles.

The visual system follows the generative-geometry thesis in `.factory/design.md`. The hero is original factory-model artwork generated with `/opt/fleet/lib/gen-image.sh`. Its source, exact prompt, and provenance are in `assets/src/`.

## Run and verify

```sh
npm ci
npm test
npm run build:site
cargo test --manifest-path src-tauri/Cargo.toml
```

The deploy output is `dist/site/`, with `dist/site/index.html` at its root. Run the desktop app with `npm run tauri dev` after installing the Tauri system packages listed in the release workflow.

Verified on 2026-08-28:

- `npm test`: 3 unit tests and 9 Playwright tests passed.
- `cargo test --manifest-path src-tauri/Cargo.toml`: 1 Rust test passed.
- `npm run build:site`: passed.
- `/opt/fleet/lib/verify-url.sh`: passed with one h1, main, lang, alt text, and no console errors.
- Playwright axe: no serious or critical findings on the landing page or exported HTML.
- Mobile Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100.
- Lighthouse lab metrics: LCP 1.3 s, FCP 1.0 s, TBT 0 ms, CLS 0.
- Initial transfer: 29 KiB. Built JS is 12.04 KiB gzip; CSS is 4.05 KiB gzip.
- Hero WebP: 13.4 KiB at 768 × 512.

Evidence is stored in `.factory/evidence/`.

## Known gaps

- v0.1 transcribes a chosen WAV file after capture. It does not yet stream microphone captions live.
- The Whisper runtime and model are not bundled. Users install `whisper-cli` and choose a model whose license fits their use.
- Project deletion removes the app's local-storage record. It is not a forensic secure erase of the device profile.
- Lab Lighthouse does not report INP without interaction; TBT was 0 ms.
- Desktop binaries are intentionally built by GitHub Actions, not in the factory worker.

## Needs operator action

- Register `private-caption-export` with the Sociobot billing engine at $39 and configure its return URL.
- Deploy `dist/site/` to `https://private-caption-export.sociobot.in`.
- Review and publish the GitHub release created from tag `v0.1.1`.
- Add `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` plus their password secrets when signed builds are required. The v0.1 workflow builds unsigned packages without them.
- Test one packaged app on each supported operating system before announcing the release.

## Next steps

- Add streaming microphone capture and rolling local transcription.
- Offer a model setup check that verifies the executable and model before a meeting.
- Add encrypted project-at-rest storage if workplace deployments require it.
