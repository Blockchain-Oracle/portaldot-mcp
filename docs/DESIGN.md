# DESIGN.md — portaldot-mcp web app

The generative-UI chat surface. Every visual property must resolve to a token here.

## Anchor
- **Primary:** aibtcdev (app.aibtc.dev) — exact category: AI chat + blockchain MCP tools + browser wallet, with tool-result cards. The interaction model (chat input → AI proposes → card with sign button → confirmed card) is lifted from here.
- **Secondary:** Linear (linear.app) — input bar, ⌘↵ to send, keyboard feel, terse copy. Vercel ai-chatbot (open, Next + AI SDK v5) — chat-shell structure reference only.
- **Tier:** Linear / Trigger.dev refined-dark. Restrained single accent, mono for all on-chain data, no decorative gradients.

## Palette (concrete hex — no "zinc-950"/"dark")
- Background: `#09090B`
- Surface (cards): `#131316`
- Surface-2 (input, elevated): `#1A1A1F`
- Border: `#26262C`
- Border-hover: `#34343C`
- Text primary: `#EDEDEF`
- Text secondary: `#9A9AA5`
- Text muted: `#6B6B76`
- Accent (Portaldot violet): `#7C5CFC` — used ONLY for the primary action (Sign & Send / Connect), active states, and the brand mark
- Accent-soft (tint bg): `rgba(124,92,252,0.12)`
- Success: `#22C55E` (confirmed tx, completed task)
- Pending: `#F59E0B` (in-flight tx)
- Destructive: `#EF4444` (errors, reverts)

## Typography
- Display: **Geist Sans** 600 — H1/H2 and the brand mark only
- Body: **Geist Sans** 400/500 — all body copy
- Mono: **Geist Mono** 400/500 — every address, hash, POT amount, block number
- Scale (px): 12 / 13 / 14 / 16 / 20 / 28

## Spacing
- Base unit: 4px
- Scale: 4, 8, 12, 16, 20, 24, 32, 48

## Radius
- Cards: 12px (`rounded-xl`)
- Inputs: 10px
- Pills (wallet status, status badges): full

## Motion
- Card hover: `border-color → #34343C`, 150ms ease (no lift on data cards)
- Button hover: `translate-y-[-1px]` + slight brightness, 150ms
- Tool-card entrance: fade + 4px slide-up, 200ms ease-out
- Streaming AI text: native `useChat` token streaming
- Loading tool call: skeleton card with subtle shimmer (`animate-pulse`), replaced in place (no layout shift)
- Tx pending: spinner inside the "Sign & Send" button; card border → pending amber

## Layout
```
┌───────────────────────────────────────────────┐
│ ◆ portaldot-mcp        [● 5F3sA…utQY · 42.0 POT]│  sticky header, brand left, wallet pill right
├───────────────────────────────────────────────┤
│  (empty: centered welcome + 4 example prompts)  │
│  user msg (right)                               │
│  AI text (left, streaming) + tool card(s)       │  scrollable message list, max-w-3xl centered
├───────────────────────────────────────────────┤
│ [ Ask Portaldot…                       ] [→]   │  sticky input bar, ⌘↵ send
└───────────────────────────────────────────────┘
```
Single route `/`. No sidebar, no settings page.

## Tool cards (generative UI)
- **BalanceCard** — address (mono, truncated `5F3sA…utQY`), Free / Reserved / Total rows, Total emphasized.
- **TransferCard** — two states: (1) *preview*: to / amount / fee est + `Sign & Send` (accent) + `Cancel`; (2) *confirmed*: ✓ success border, tx hash (mono), block, explorer link.
- **BlockInfoCard** — block # (mono), hash (mono truncated), human timestamp, extrinsic count.
- **TaskCard / TaskListCard** — task id, description, status chip (⏳ pending amber / ✓ done green), tx hash on create.
- All cards: `bg #131316`, `border #26262C`, `rounded-xl`, `p-4`, header row with small icon + label (text-secondary, 13px).

## Interaction states (per card — all required)
- Hover: border → `#34343C`.
- Focus (buttons/input): 2px accent focus ring `#7C5CFC`, never `outline:none` alone.
- Active: button brightness down, 1px press.
- Disabled: 40% opacity + `cursor-not-allowed` (Sign button while signing).
- Empty: welcome screen with 4 example prompts.
- Loading: skeleton card (shimmer) until tool resolves.
- Error: destructive-bordered card with the tool's error message (mono for any hash/address in it).

## Banned (hard)
- `bg-gradient-to-*` of any purple/violet/blue/pink — NO decorative gradients.
- `rounded-full` on cards (only pills/badges).
- `font-sans`/Inter for addresses, hashes, amounts — those are ALWAYS mono.
- `text-gray-600`-on-light as body — this is a dark app; use the tokens above.
- Mock data: "John Doe", "user@example.com", picsum/ui-avatars, "0x000…".
- Centered gradient hero. Three identical undifferentiated cards.
