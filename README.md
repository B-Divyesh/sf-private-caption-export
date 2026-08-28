# Private Caption Export

Select agreed meeting captions and export an accessible handoff. The app is for hearing-impaired professionals and privacy-conscious teams who cannot send a full transcript to a cloud service.

Try the isolated sample at `https://private-caption-export.sociobot.in/demo`. Demo edits use a separate session-only storage key.

## What it does

- Imports SRT, VTT, and plain-text captions.
- Runs an installed `whisper-cli` model against local WAV audio in the desktop app.
- Searches local caption text and speaker names.
- Keeps caption editing and export available offline after the first web visit.
- Marks uncertain speakers and words for review.
- Exports only selected spans as accessible HTML or plain text.
- Requires confirmed participant consent before transcription or export.
- Stores real projects in the local device profile. There is no account or meeting bot.

Audio is never included in an export. The app does not identify speakers. Obtain participant consent and follow local recording laws.

## Price and license

The core import, edit, select, and export flow is free. An optional desktop license costs $39 once and adds dark and high-contrast HTML export themes. Core accessibility and export are not gated. Checkout and license verification use the Sociobot billing API.

The factory registers the product identifier after build. No payment provider key is stored here.

## Run the web app

Requirements: Node.js 22 and npm.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:5173/`. Use `/demo` for the clean sample sandbox.

## Run the desktop app

Requirements: Node.js 22, Rust stable, Tauri 2 system dependencies, and `whisper-cli` on `PATH` for local audio transcription.

```sh
npm ci
npm run tauri dev
```

Choose a local Whisper model file when transcribing audio. Model files are not bundled. Check the chosen model's license before workplace use.

## Test and build

```sh
npm test
npm run build
cargo test --manifest-path src-tauri/Cargo.toml
```

The exact static build command is `npm run build:site`. It writes the deployable site to `dist/site/`, with `index.html` at that root.

Every public claim and its sandbox check is listed in `.factory/claims.json`. Product art direction and provenance are in `.factory/design.md`.

## Desktop releases

Tags matching `v*` run `.github/workflows/release.yml`. The matrix builds unsigned macOS, Windows, and Linux packages. It publishes release assets, `SHA256SUMS`, and `latest.json`.

After release assets are available, install from the detected-platform button on the site. Command-line installation is also available:

```sh
curl -fsSL https://private-caption-export.sociobot.in/install.sh | sh
```

```powershell
irm https://private-caption-export.sociobot.in/install.ps1 | iex
```

Unsigned builds may show an operating-system warning. On macOS, use right-click then Open. On Windows, confirm the publisher warning only after checking the checksum.

## Privacy and deployment

No analytics, third-party fonts, or runtime CDN scripts are used. The landing page requests release metadata from GitHub. License checks send only the license token to Sociobot. Caption content is not sent with either request.

Static deployment configuration, routes, headers, caching, and SPA fallback ship in `public/staticwebapp.config.json`. The factory owns DNS and deployment.

## License

MIT. See [LICENSE](./LICENSE).
