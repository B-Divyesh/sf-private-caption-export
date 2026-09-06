# Verify selected local caption export repair

## Verdict: PASS

Implementation reviewed: `c306e6e5b0a749e021753d462dcc35a8a3b84bd0` (`v0.1.3`).

The job is to choose consented local captions and export only the agreed, accessible excerpt. It is for hearing-impaired professionals and privacy-conscious teams. Fresh desktop and phone checks found that the first screen states this job, names this audience, and offers **Try it with sample data** with its result explained.

## Fixed findings

1. Unknown URLs now return HTTP 404. The deployed Static Web App serves the styled not-found screen with a real 404 status. The local and live checks both confirmed `GET /not-a-real-page` is 404. The Playwright regression checks the status, title, heading, and return action.
2. The five privacy claims recorded in `verification-1.md` are now registered in `.factory/claims.json` with one tagged outcome test each. The tests exercise the demo’s recorded requests, local command arguments, both export formats, reviewer-entered speaker text, and the release/license request payloads.

## Current checks

- Clean setup: `npm ci` passed.
- Full suite: `npm test` passed with 4 unit tests and 13 browser tests.
- Rust suite: `cargo test --manifest-path src-tauri/Cargo.toml` passed with 3 tests.
- Static build: `npm run build` passed and wrote `dist/site/`.
- Claims: every one of the 13 exact commands declared in `.factory/claims.json` passed from the clean setup.
- Accessibility: `/opt/fleet/lib/verify-url.sh` passed locally and live. Live axe checks on the landing page, demo, and 404 page had zero serious or critical findings.
- Fresh live desktop and phone checks passed. The demo keeps edits in `demo:pce:project`, preserves the real project, keeps its label after reload, resets correctly, and discards demo storage on Start for real.
- Release: GitHub Actions workflow `34014413023` passed quality, macOS, Windows, Linux, and manifest jobs. `latest.json` is valid. A downloaded Linux DEB matched `SHA256SUMS` and launched in a clean temporary consumer path under Xvfb.

## Remaining dependency

Sociobot billing registration is still required before the advertised $39 checkout can grant a valid license. The paid export themes remain paid, and the free core remains usable.
