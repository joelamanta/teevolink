# TeevoLink XD10 Draft (HTML prototype)

Static HTML draft for **XD10 + MD1T V2** based on PRD `docs/PRD-XD10-MD1T-V2.md`.

## Open

Double-click or:

```bash
open "/Users/teevoteam/Documents/Claude/Projects/Teevo Joel's Claude/teevolink/draft-xd10/index.html"
```

Or serve locally:

```bash
cd "/Users/teevoteam/Documents/Claude/Projects/Teevo Joel's Claude/teevolink/draft-xd10"
python3 -m http.server 8765
```

Then visit http://localhost:8765

## What's included

- Connect flow (simulate 2.4G / USB-C / BT read-only)
- Overview, DPI, Lighting, Buttons (Table A 32), Macros, Profiles, Advanced
- Receiver DISP P1–P5 preview + album + barrage
- FN UI config (switches, UI-P4/P5 grids Table B, UI-P6)
- Firmware OTA (simulated progress)
- CN / EN toggle, dark / light theme
- Auto-save toast (mock)

## Not included (production TeevoLink)

- Real WebHID / device protocol
- Host dashboard PC bridge (P2)
- V2 controls active (shown grayed)

## XD10 Final docs (deployed)

After `npm run build`, these live beside the draft:

- `/xd10/ui-features.html` — vendor Final UI 功能介绍 (2026-11-20)
- `/xd10/` — resource hub

Sidebar **Resources** links to the guide and screen demo.

## Reference

Styled after Terra Pro TeevoLink (`teevolink/src`) and Teevolution Design System v2.0 tokens.
