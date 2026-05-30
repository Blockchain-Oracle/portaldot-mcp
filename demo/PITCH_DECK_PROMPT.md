# Claude Design — pitch deck prompt

Paste-ready prompt for [Claude Design](https://claude.ai/) (or any AI design tool that accepts a brief + a reference URL). Generates a 4-slide hackathon pitch deck for portaldot-mcp.

> Tip: paste the **PROMPT** block below as-is. The reference URLs let the tool pull live visuals and colors from the app so the deck matches the product.

---

## PROMPT

```
Design a 4-slide hackathon pitch deck for portaldot-mcp, the first MCP
server for Portaldot — a Substrate Layer-0 chain (token POT, ss58:42,
14 decimals). The product is two surfaces: an MCP server installable
into any AI agent client, and a generative-UI web chat for humans.

References (pull visual style, screenshots, and product context from
these):
- Live app:        https://portaldot-mcp.vercel.app
- Tool catalog:    https://portaldot-mcp.vercel.app/docs/tools
- npm package:     https://www.npmjs.com/package/portaldot-mcp
- Source code:     https://github.com/Blockchain-Oracle/portaldot-mcp

Submission context: Portaldot Mini Hackathon Online S1, Track 4
(AI-Powered Onchain Workflows). Audience is hackathon judges. Live on
Portaldot mainnet, open source, non-custodial.

────────────────────────────────────────────────────────────────
STYLE
────────────────────────────────────────────────────────────────
- Dark mode. Background near-black with a faint violet undertone
  (#0F0E14, oklch 0.118 0.008 282). Card surfaces #16151D (oklch
  0.158 0.010 282).
- Two accents:
    Violet  #7C5CFC  (oklch 0.66 0.22 288)  — actions, brand, links.
    Cyan    #5BD2FF  (oklch 0.78 0.13 220)  — telemetry only: live
    block heights, live status dots, "MAINNET" badges.
  Treat the cyan as an oscilloscope signal, never a button.
- Type: PP Neue Montreal (or a close geometric display like Söhne or
  GT Sectra) for headlines, with italic accents on one word per
  headline. Geist Sans (or Inter) for body. Geist Mono (or JetBrains
  Mono) for every address, hash, block number, amount.
- One core message per slide. No bullet soup. No clipart.
- Heavy negative space. Hackathon-pitch grade, not corporate-deck.
- The visual language is "Bloomberg terminal × Linear changelog ×
  Swiss financial print" — restrained, technical, premium. Read the
  landing at portaldot-mcp.vercel.app to absorb it directly.

Brand mark (use on every slide, small, top-left or as a watermark in
the bottom-left meta-strip):
  ◇ portaldot-mcp
  ("◇" is a diamond glyph; pair with the wordmark "portaldot-mcp" in
  Geist-Mono-like font.)

────────────────────────────────────────────────────────────────
SLIDE 1 — THE PROBLEM
────────────────────────────────────────────────────────────────
Title:    Talking to a Substrate L0 is still a developer problem.
Subhead:  Pallets. Extrinsics. JSON parameters. Forty events to
          parse for the one you wanted.
Visual:   A grayscale screenshot of Polkadot.js Apps' raw extrinsic
          form — the metadata explorer with its dropdowns of pallets
          and JSON-shaped parameter fields. Dim it to ~60% so it
          reads as "the hard way." Overlay a single bright cyan
          telemetry dot in the corner labeled "MAINNET" to remind
          the viewer this isn't a testnet limitation.
Footer:   "Portaldot has 28+ pallets. Most POT holders never touch
          more than `transferKeepAlive`."

────────────────────────────────────────────────────────────────
SLIDE 2 — THE SOLUTION
────────────────────────────────────────────────────────────────
Title:    portaldot-mcp — the AI gateway for Portaldot.
Subhead:  Plain language in. Signed transaction out. Receipts the
          whole way.
Visual:   The portaldot chat with two receipt cards stacked — the
          BalanceCard showing identicon + 44px display POT total + QR,
          and the TransferCard mid-flow with the PAID stamp rotated
          -14 degrees over the body. Treat it like an iPhone keynote
          slide — one product shot, oversized, centered, on the dark
          canvas.
Footer:   "Live on Portaldot mainnet. Non-custodial. Your keys never
          leave your device."

────────────────────────────────────────────────────────────────
SLIDE 3 — HOW IT WORKS
────────────────────────────────────────────────────────────────
Title:    One MCP server. Two surfaces. The whole chain.
Visual:   A four-node horizontal flow rendered as connected receipt
          cards (not a numbered bullet list):

            [ 1. Install ]  →  [ 2. Connect ]  →  [ 3. Ask ]  →  [ 4. Sign ]
              npx -y             SubWallet,         "Send 1 POT      Wallet
              portaldot-mcp       Talisman,          to 5Grw…"        signs
              OR open the         Polkadot.js,       Model picks      locally;
              web app             Nova               the right tool   PAID
                                                                       stamp
                                                                       lands

          Each node a small receipt-style card (rounded border, meta-
          strip with a tag like "01 · INSTALL"). Arrows between nodes
          are thin with a subtle violet glow.
Footer:   "34 tools · 28+ pallets · ink! Task Ledger contract · POT
          gas."

────────────────────────────────────────────────────────────────
SLIDE 4 — TRY IT
────────────────────────────────────────────────────────────────
Title:    Live on Portaldot mainnet today.
Visual:   Big QR code in the center linking to
          https://portaldot-mcp.vercel.app. Around it, monospace text
          rows for the four links below. Single cyan telemetry dot
          pulsing next to "MAINNET" at the top of the card.
Links:    portaldot-mcp.vercel.app             live web app
          portaldot-mcp.vercel.app/docs        in-app docs
          npmjs.com/package/portaldot-mcp      npm package
          github.com/Blockchain-Oracle/portaldot-mcp   source, MIT
Footer:   "Portaldot Mini Hackathon Online S1 · Track 4 · AI-Powered
          Onchain Workflows"

────────────────────────────────────────────────────────────────
CONSTRAINTS — what NOT to do
────────────────────────────────────────────────────────────────
- No stock photography (handshakes, lightbulbs, abstract swooshes).
- No "Our Innovative Solution"-style corporate language anywhere.
- No purple-to-pink or purple-to-blue Tailwind-default gradients. The
  violet is a flat accent, the cyan is a telemetry signal — neither
  becomes a gradient stop.
- No four-column "Features" grid. We're not selling enterprise
  software.
- No "Team / About Us" slide. Hackathon judges don't need it.
- No emojis anywhere in the deck.
- No icons in pastel circles. If an icon is used, mono outline,
  violet accent only when meaningful.
- No "first AI gateway for Portaldot" bragging on slide 1 — let the
  problem land first.

Export as a single PDF, landscape 16:9, plus individual PNGs at
1920x1080.
```

---

## How to use

1. Open [Claude Design](https://claude.ai/) (or your preferred design tool).
2. Paste the **PROMPT** block above.
3. Let it generate. Iterate on any slide you don't like — usually slides 1 and 3 need the most refinement.
4. Once happy: export, drop into your hackathon submission alongside the demo video.

## After generation — quick QA pass

- Does slide 1 land the problem in 5 seconds of looking at it?
- Does slide 2 say what portaldot-mcp is in one sentence the viewer's mom could parse?
- Does slide 3 show a flow (not a list)?
- Does slide 4 have a working QR code and the actual mainnet URL?

If any of those are "no," prompt back: *"Redo slide N. Make it [specific change]."*
