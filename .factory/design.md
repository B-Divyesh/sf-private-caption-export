# Visual thesis — Caption lattice

## Direction and fit

The direction is **generative geometry**. A meeting becomes a time-indexed field of rectangular caption cells. A bright path joins only the cells a person selects, making consent boundaries visible. The geometry explains the product: the whole conversation stays dark and local; the agreed excerpt becomes a clear handoff.

This is a focused desktop instrument, not a generic meeting dashboard. The layout uses an asymmetric transcript rail, oversized time numerals, clipped corners, and thin drafting lines. There are no gradient blobs or decorative feature cards.

## Tokens

- `--ink: #eaf7f4` — primary text on dark surfaces
- `--muted: #a8c0bc` — secondary text; 7.3:1 on the main background
- `--void: #071311` — main background
- `--deep: #0d211d` — raised work surfaces
- `--line: #294b44` — borders and construction lines
- `--signal: #62f2cf` — selected excerpt path and primary action
- `--signal-ink: #052019` — text on the signal color
- `--consent: #ffc56e` — consent marker and warnings
- `--danger: #ff8e86` — deletion and errors
- `--paper: #f5f0e4` / `--paper-ink: #13231f` — exported-document preview

All body text combinations meet 4.5:1. Status never depends on color alone.

## Type and spacing

Display and data text use the self-hosted/system monospace stack `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`. Body copy uses `Inter` only if a local subset is available, otherwise `system-ui, -apple-system, Segoe UI, sans-serif`. This pairing makes timestamps exact while keeping instructions plain. No font request leaves the device.

Spacing follows an 8 px base: 4, 8, 16, 24, 32, 48, 72, 96. Text measure tops out near 66 characters. Buttons and fields are at least 44 px tall.

## Shape and interaction grammar

- Containers have clipped top-right corners made with `clip-path`; essential outlines are duplicated with standard borders for high contrast modes.
- Selected spans gain a 4 px signal bar and join the export queue immediately.
- Uncertain words use a dotted underline plus the visible label “check”.
- Consent is an explicit session control and a state line in every export.
- Destructive deletion names the project and requires confirmation.
- Keyboard: tab reaches every action; caption rows use checkboxes; Escape closes dialogs.

## Motion

The signature motion is a one-time path draw across the hero lattice, 600 ms. UI state changes use opacity and a 2 px translation for 180 ms. Nothing loops. With `prefers-reduced-motion: reduce`, path drawing and movement are removed and states appear immediately.

## Light treatment

The app is intentionally dark because live captions often run beside video calls. Export previews use the warm paper palette to distinguish private workspace from shared output. This explicit dual treatment replaces a separate theme switch in v1.

## Asset plan and provenance

- `public/caption-lattice.webp`: original generated geometric editorial illustration for the landing page.
- `public/og-private-caption-export.png`: hand-composed from product geometry and type for social previews.
- Product mark, icons, waveform, and 404 geometry are hand-authored SVG/CSS.

Prompt sheet: “Abstract generative geometry showing a private meeting transcript as a dark architectural lattice of timestamped blocks, with only a few connected blocks illuminated in mint and amber, precise editorial 3D paper-cut relief, no people, no interfaces, deep bottle green background, quiet directional light, crisp edges, generous negative space, no text, no letters, no numbers, no watermark, no logo, no gradients.”

Generation: factory image model via `/opt/fleet/lib/gen-image.sh`, 2026-08-28. Generated artwork is original to this product. The final candidate is reviewed for text artifacts, seams, unintended marks, and palette fit. Source prompt is stored beside the source image.
