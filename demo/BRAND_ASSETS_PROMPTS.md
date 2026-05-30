# portaldot-mcp — brand asset prompts

Three paste-ready image generation prompts for **standalone brand assets** — not video B-roll. Each image's job is to communicate what portaldot-mcp is to someone who has never heard of it. They go on social posts, in the GitHub README, in the docs, in pitch follow-ups. They are *not* meant to be cut into a video.

Tool-agnostic — works with Midjourney, DALL·E 3 / GPT-Image, Google Imagen / Whisk, Claude Design's image mode, Recraft, or Ideogram (Ideogram is the most reliable for the small wordmark text).

**Brand watermark on every image:** small `◇ portaldot-mcp` wordmark in the **top-right corner**. Diamond glyph (◇) in violet `#7C5CFC`, wordmark in white, Geist-Mono-style typeface. Treat it like a network logo on a news lower-third — subtle, consistent, never hero-sized. About 3% of canvas height.

References to share with the tool when it asks for visual context:

- Live app:        https://portaldot-mcp.vercel.app
- Tool catalog:    https://portaldot-mcp.vercel.app/docs/tools
- Source code:     https://github.com/Blockchain-Oracle/portaldot-mcp

---

## Shared style (applies to all three)

- **Format:** 16:9 landscape, 1920 × 1080, PNG.
- **Background:** near-black with a faint violet undertone, `#0F0E14` (oklch `0.118 0.008 282`). Card surfaces `#16151D` (oklch `0.158 0.010 282`).
- **Two accents, rationed:**
  - **Violet** `#7C5CFC` (oklch `0.66 0.22 288`) — actions, brand mark, link emphasis. Roughly 8–12% of canvas.
  - **Cyan** `#5BD2FF` (oklch `0.78 0.13 220`) — telemetry only: live block heights, live status dots, "MAINNET" badges. Roughly 3–6% of canvas. Treat it as an oscilloscope signal, never a fill.
- **Type:** PP Neue Montreal (or similar geometric display — Söhne, GT Sectra) for headings. Geist Sans (or Inter) for body labels. Geist Mono (or JetBrains Mono) for every address, hash, block number, amount, pallet name.
- **Mood:** Bloomberg terminal × Linear changelog × Swiss financial print. Heavy negative space. Restrained, technical, premium.
- **Watermark:** top-right corner `◇ portaldot-mcp` — diamond glyph in violet, wordmark in white mono, ~3% of canvas height.
- **Hard avoids:** stock photography, smiling business people, handshakes, pastel gradients, lightbulbs, blue swooshes, isometric people, AI-generated text glitches in body copy, emojis, 3D renders unless specifically requested, the word "magical" or any AI-marketing copy anywhere in the image.

---

## Brand Asset 1 — Hero · "Talk to a Substrate L0"

**Goal:** the single best post-this-on-social-and-it-explains-the-product image. Communicates the product is real, on-chain, and signed by you.

```
PROMPT:

Cinematic dark-mode editorial composition, 16:9, 1920×1080. Centered
in the frame, oversized: a single portaldot chat receipt card
floating against the dark canvas, treated like an iPhone keynote
slide. The card is a Polkadot BalanceCard:

- Top meta-strip in 9px mono uppercase, letter-spaced 0.18em:
  "● portaldot_get_balance · MAINNET · ISSUED 14:22:08 UTC"
  (the leading "●" is a small cyan dot with a soft glow)
- Below the meta-strip, a dashed perforation line
- Then the body: a small Polkadot identicon (a hexagonal arrangement
  of 19 colored dots), to its right the truncated address
  "5F3sA…utQY" in mono with a subtle violet halo
- Below that, the headline number in a large geometric display font:
  "12,847.62" sized roughly 64pt, with the tiny mono label "POT"
  to the right
- Below that, two sub-rows on a darker inset card: "Free" and
  "Reserved" with their POT amounts
- A small QR code in the right side of the card, caption "scan to
  send"

Background: deep near-black `#0F0E14` with a faint violet glow
behind the card, radiating from the top of the card downward, at
~30% opacity. Subtle fractal noise grain across the whole canvas at
~4% opacity. Bottom of the frame: a soft horizontal violet gradient
floor.

To the right of the receipt card, at roughly 25% opacity, a second
receipt card peeking in from the edge — the TransferCard with a
"PAID" stamp rotated -14° in muted green/cyan, visible enough to
read the metaphor but not competing with the BalanceCard.

Headline overlaid in the top-left quadrant (left of the receipt
card), in PP-Neue-Montreal-style display 56pt:
   "Talk to Portaldot,
    in plain language."
("plain language" is in italic, in cyan `#5BD2FF`.)

Style: dark mode, restrained, Bloomberg-meets-Linear. Color rationed
strictly — violet for the identicon halo + the floor gradient, cyan
ONLY on the live dot in the meta-strip, the "plain language" italic,
and one telemetry status nub. Everything else neutral white/gray on
dark.

Top-right corner: brand watermark `◇ portaldot-mcp` — diamond glyph
in violet `#7C5CFC`, wordmark in white Geist-Mono-style, ~3% canvas
height. Position consistent with brand assets 2 and 3.

Output: 16:9 landscape, 1920×1080, PNG.
```

---

## Brand Asset 2 — Architecture · "One core, two surfaces"

**Goal:** replace a hand-drawn architecture diagram with a rendered image that explains the system at a glance. This is what gets pasted into a pitch when someone says "how does it work under the hood."

```
PROMPT:

Clean technical architecture diagram, 16:9, 1920×1080, dark mode.
Five labeled nodes connected by thin directional arrows, arranged on
a horizontal axis. Each node is a rounded receipt-style card on the
dark canvas with a 1px border and a small meta-strip on top.

LEFT COLUMN — the two clients (stacked vertically):

  [ AI AGENT ]
   meta-strip: "MCP CLIENT"
   body: a small line-art glyph of a terminal cursor, label "Claude
         Code · Cursor · Claude Desktop · Console"

  [ HUMAN ]
   meta-strip: "WEB BROWSER"
   body: a small line-art glyph of a wallet, label "SubWallet ·
         Talisman · Polkadot{.js} · Nova"

MIDDLE COLUMN — the two transports (stacked vertically), each
connected by a thin violet arrow from its client on the left:

  [ packages/mcp ]
   meta-strip: "MCP SERVER · stdio"
   body: glyph of a small protocol icon

  [ packages/web ]
   meta-strip: "NEXT.JS · AI SDK v6"
   body: glyph of a small browser frame

CENTER NODE — the shared core, taller than the others:

  [ packages/core ]
   meta-strip: "SHARED · @polkadot/api"
   body: a stack of three tagged rows in mono — "34 tools", "wallet",
         "contract".
   This card is slightly larger and has a soft violet outer glow,
   visually anchoring the diagram as the brain.

RIGHT COLUMN — the chain, one node, with a small cyan "live"
telemetry dot pulsing at the top:

  [ PORTALDOT MAINNET ]
   meta-strip: "● MAINNET · BLOCK #1,284,712"
   body: glyph of an interconnected node graph (a small Substrate-
         like polyhedron), label "POT · ss58:42 · 14 decimals"

All arrows are thin (1.5px), white/gray, with subtle violet glow on
the request-direction arrows (left-to-right) and subtle cyan glow on
the response-direction arrows (right-to-left). Arrows are labeled in
9pt mono uppercase letter-spaced 0.18em: "tool call", "RPC", "card
stream", "extrinsic", "finalized".

Background: near-black `#0F0E14`. Subtle 4% fractal noise grain. No
gridlines, no axes, no chart frame.

Color budget: violet only on the core glow + the request arrows.
Cyan only on the mainnet dot + the response arrows + telemetry text.
Everything else is monochrome white/gray on dark.

Bottom strip: a thin perforated divider, then a footnote row in mono
uppercase 9pt — "INK! v5 · POT GAS · TASK LEDGER CONTRACT GATES
DEPLOY".

Top-right corner: brand watermark `◇ portaldot-mcp` — diamond glyph
in violet `#7C5CFC`, wordmark in white Geist-Mono-style, ~3% canvas
height. Identical placement to brand assets 1 and 3.

Output: 16:9 landscape, 1920×1080, PNG.
```

---

## Brand Asset 3 — How it works · "The 4-step flow"

**Goal:** the four-step user flow as a clean diagram people can grasp in 4 seconds. Replaces a numbered bullet list anywhere a user flow needs to be communicated visually.

```
PROMPT:

Clean flat-design flow diagram, 16:9, 1920×1080, dark mode. Four
nodes arranged in a horizontal left-to-right flow with thin
connecting arrows. Each node is a rounded receipt-style card on the
dark canvas, each with a small numbered meta-strip in mono uppercase
letter-spaced 0.18em.

NODE 1 — meta-strip "01 · INSTALL"
  Title (display, 22pt): "Install"
  Subtext (mono, 11pt):  "$ claude mcp add portaldot --
                          npx -y portaldot-mcp"
  Icon: line-art terminal prompt glyph, single-stroke, white.

NODE 2 — meta-strip "02 · CONNECT"
  Title:    "Connect a wallet"
  Subtext:  "SubWallet · Talisman · Polkadot{.js} · Nova"
  Icon: a small Polkadot identicon glyph (19 colored dots in a
        hexagonal arrangement) — this is the one place the identicon
        uses its natural multi-color palette.

NODE 3 — meta-strip "03 · ASK"
  Title:    "Ask in plain language"
  Subtext:  "'Send 1 POT to 5Grw…'"
  Icon: line-art speech-bubble glyph, single-stroke, white. A small
        cyan telemetry dot sits inside the bubble, signaling "the
        model picks the tool."

NODE 4 — meta-strip "04 · SIGN"
  Title:    "Sign locally · finalize"
  Subtext:  "PAID stamp lands when the block does"
  Icon: a small line-art shield glyph with a checkmark inside,
        single-stroke. The whole node is tinted slightly with a soft
        success-cyan border (`#5BD2FF` at ~30% opacity), giving the
        viewer's eye a "finish line" cue.

Arrows between nodes: thin (1.5px), single-stroke, with a subtle
Bitcoin-orange... NO — with a subtle violet `#7C5CFC` glow.
(Important: violet, NOT orange. Different brand from Mezo.) Each
arrow is labeled in 9pt mono uppercase: "→ ONCE", "→ ONCE", "→ EVERY
PROMPT".

Above the row of nodes, in PP-Neue-Montreal-style display 44pt,
left-aligned:
   "From prompt to signed
    transaction."
("signed" is italic, in cyan `#5BD2FF`.)

Below the row of nodes, a thin perforated divider, then a footnote
row in mono uppercase 9pt, centered:
   "● MAINNET · BLOCK #1,284,712 · LATENCY 142ms · v0.4.x"
(The leading "●" is a small cyan dot with a soft glow.)

Style: flat vector aesthetic. NO 3D, NO photorealism, NO isometric
perspective. Dark mode, background `#0F0E14`. Card surfaces `#16151D`
with 1px borders `#2A2730`. Icon strokes white/gray. Color rationed
strictly: violet only on the arrows and Node 4's shield checkmark.
Cyan only on the live status dot in Node 3's bubble, Node 4's tinted
border, and the bottom telemetry strip. Everything else white/gray
on dark.

Top-right corner: brand watermark `◇ portaldot-mcp` — diamond glyph
in violet `#7C5CFC`, wordmark in white Geist-Mono-style, ~3% canvas
height. Identical placement to brand assets 1 and 2.

Output: 16:9 landscape, 1920×1080, PNG.
```

---

## How to use

1. Pick your image tool. Recommendations by use case:
   - **Ideogram** — best at rendering the small wordmark + mono labels readably without garble. Strong default choice for assets 2 and 3.
   - **GPT-Image / DALL·E 3** — strongest at "match the style of my previous image" follow-ups. Generate asset 1 first, then ask "now generate brand asset 2 in the same style" with the brand asset 2 prompt.
   - **Midjourney v6** — best for the painterly, cinematic feel of asset 1 (use `--ar 16:9` and `--style raw`). Garbles text — overlay the wordmark in Figma afterwards.
   - **Recraft** — best for the flat-vector look of asset 3.
2. Paste the **PROMPT** block under the asset you want.
3. Generate 4 variations. Pick the one with:
   - The cleanest brand watermark in the top-right (no garble).
   - The color budget actually held (regenerate if violet or cyan dominates the canvas).
   - The wordmark legible at thumbnail size.
4. If text in the image is garbled (a known diffusion-model failure mode), generate without the small mono labels and overlay them in Figma or CapCut after. This is faster than wrestling with the model.

## After generation — quick QA pass

For each asset, check:

- Is the `◇ portaldot-mcp` wordmark in the **top-right corner**, readable, not garbled?
- Does violet stay at ~10% of the canvas and cyan stay at ~5%? (If the whole frame is violet, regenerate — that's the most common failure mode.)
- Do all three assets share enough style that they read as a family? If one is photorealistic and another is flat-vector, regenerate the odd one out.
- Is the core message of each asset clear at thumbnail size? (Hold it 6 feet from the screen. Still clear?)
- Are there zero emojis anywhere in the image?

## Where these assets go

- **Brand asset 1 (Hero):** the X / LinkedIn post asset. Top of the GitHub README as a hero image. Lead slide of any pitch follow-up email.
- **Brand asset 2 (Architecture):** embedded in the README under a "Architecture" section. Inside `docs/architecture.md` as the canonical diagram. In a pitch as "how does it work under the hood."
- **Brand asset 3 (How it works):** embedded near the top of the live app landing page if we want a static fallback for the animated section. Inside `demo.md` as a single-image alternative to the GIF walkthrough.

These assets are **not** for the demo video. The video uses live screen recordings of the actual web app — captured directly off `portaldot-mcp.vercel.app`. See `DEMO-SCRIPT.md` for what to record.
