# DESIGN.md — portaldot-mcp web

Two surfaces, one product, one token set:
- **`/` Landing** — marketing surface. Premium author-built sections (premium-ui skill). Sells "the first AI gateway for Portaldot."
- **`/app` Chat** — the generative-UI chat. Plain-language → AI proposes → tool-result card → wallet sign → confirmed card.

Every visual property must resolve to a token below. No raw hex/`zinc-950`/inline styles in components.

## Anchor / direction
- **Tier:** Linear / Trigger.dev / Prisma refined-dark dev-tool. Restrained, technical, premium — not playful, not corporate-SaaS.
- **Landing hero:** cinematic with a **single tasteful violet radial glow** (prisma-hero). NOT a linear `from-purple to-blue` slop gradient, NOT gradient text on headings.
- **App:** aibtcdev interaction model (chat → card-with-sign → confirmed). Spotlight-on-hover surfaces for cards.
- **Identity beat:** Portaldot violet on near-black, mono for every on-chain datum, real lucide icons (never emoji/unicode glyphs).

## Palette (hex + OKLCH — neutrals carry a subtle violet undertone, never pure gray)
| Role | Hex | OKLCH | Use |
|---|---|---|---|
| bg | `#08080C` | `oklch(0.145 0.012 285)` | page background |
| surface | `#111017` | `oklch(0.185 0.014 285)` | cards, header |
| surface-2 | `#18171F` | `oklch(0.225 0.015 285)` | input, elevated, hover bg |
| border | `#242230` | `oklch(0.285 0.018 285)` | hairlines |
| border-hover | `#332F44` | `oklch(0.355 0.024 286)` | hover/focus hairlines |
| fg | `#F4F3F7` | `oklch(0.965 0.004 285)` | primary text |
| fg-secondary | `#A7A4B5` | `oklch(0.725 0.013 286)` | labels, secondary |
| fg-muted | `#6E6B7E` | `oklch(0.555 0.016 286)` | muted, placeholders |
| accent | `#7C5CFC` | `oklch(0.625 0.205 285)` | **brand + primary action ONLY** |
| accent-hover | `#8F73FF` | `oklch(0.68 0.19 285)` | accent hover |
| accent-soft | `rgba(124,92,252,0.12)` | — | tint bg, active pill, hero glow |
| success | `#34D399` | `oklch(0.78 0.16 165)` | confirmed tx, completed task |
| pending | `#FBBF24` | `oklch(0.83 0.16 85)` | in-flight tx |
| destructive | `#F87171` | `oklch(0.71 0.18 22)` | errors, reverts |

**Accent has ONE semantic role: brand mark + primary action.** State color comes from success/pending/destructive. Never paint everything violet (slop tell).

### shadcn semantic-var mapping (set in `:root` AND `.dark`)
`--background`→bg · `--card`/`--popover`→surface · `--secondary`/`--muted`/`--input`→surface-2 · `--border`→border · `--ring`→accent · `--foreground`/`--card-foreground`→fg · `--muted-foreground`→fg-secondary · `--primary`→accent · `--primary-foreground`→`#0B0A10` · `--accent`→accent-soft · `--destructive`→destructive · project aliases (`--color-bg`, `--color-surface`, `--color-surface-2`, `--color-border`, `--color-border-hover`, `--color-fg`, `--color-fg-secondary`, `--color-fg-muted`, `--color-accent`, `--color-accent-soft`, `--color-success`, `--color-pending`, `--color-destructive`) point at the same values so old + new components share one look.

## Typography (Geist — mandated by CLAUDE.md; non-Inter, compliant)
- Display: **Geist Sans** 600 — H1/H2, brand mark. Tracking `-0.02em` on H1.
- Body: **Geist Sans** 400/500.
- Mono: **Geist Mono** 400/500 — **every** address, hash, POT amount, block number, asset id.
- Scale (px): 12 / 13 / 14 / 16 / 20 / 28 / 40 / 56 (40/56 landing only).

## Spacing / radius
- Base 4px. Scale: 4, 8, 12, 16, 20, 24, 32, 48, 64, 96.
- Radius: cards `14px` (`--radius`), inputs `10px`, pills/badges full, landing feature tiles `18px`.

## Icons
- **lucide-react only.** Kill all emoji/unicode glyphs (◆ ▦ ≈ ☰ 🪙 ↗ ◷ ✓ ⏳ ⚠ ✕). Map: balance→`Wallet`, block→`Box`/`Blocks`, fee→`Receipt`, tasks→`ListChecks`, token→`Coins`, transfer→`ArrowUpRight`, identity→`BadgeCheck`, validators→`ShieldCheck`, network→`Activity`, error→`TriangleAlert`, success→`CircleCheck`, pending→`Loader`, wallet-connected→`CircleDot`, generic→`Sparkles`.

## Motion (consistent token, not bolted on)
- Easing: `cubic-bezier(0.22,1,0.36,1)` (premium "out"). Durations: 150ms micro, 220ms card/reveal, 420ms hero.
- Card hover: border→border-hover + spotlight follows cursor (150ms). No lift on data cards.
- Button hover: `-translate-y-px` + brightness, 150ms. Active: 1px press.
- Tool-card entrance: fade + 6px slide-up, 220ms.
- Loading: shimmer skeleton (not bare pulse), replaced in place — no layout shift, no blank flash.
- Tx pending: spinner in "Sign & Send"; card border → pending.
- Landing: hero glow breathes; section reveals on mount/in-view — **must render visible un-scrolled** (no `whileInView once` opacity-0 trap above the fold).

## Surfaces / cohesion
- All installed premium components reskinned to these tokens — kill foreign radii/shadows/accents/fonts. Every property → token. No Frankenstein.
- Tailwind v4: custom colors/keyframes as CSS vars + `@theme`/`@keyframes` in `globals.css`. Port any v3-ism (`theme(...)`, `theme.extend`, invented utilities) shipped by community components.

## Routing
- `/` landing · `/app` chat. `/app` link is the landing's primary CTA ("Open the app" / "Try it").

## Interaction states (every interactive element — all required)
Hover · focus (2px accent ring, never bare `outline:none`) · active (press) · disabled (40% + `cursor-not-allowed`) · empty · loading (shimmer) · error (destructive-bordered card, mono for any hash/address).

## Banned (hard — project anti-slop floor, extends premium-ui blocklist)
- `bg-gradient-to-*` of purple/violet/blue/pink as decoration; gradient **text** on headings.
- Emoji/unicode as icons — lucide only.
- `rounded-full` on cards (pills/badges only).
- `font-sans`/Inter for addresses/hashes/amounts — always mono.
- Untouched shadcn zinc default; single-accent-everything.
- Mock data: "John Doe", "user@example.com", picsum/ui-avatars/randomuser, "0x000…", "Lorem ipsum".
- Three identical undifferentiated cards; every section same vertical rhythm.
- lucide brand glyphs removed from recent versions (`Github`/`Twitter`/etc.) — inline SVG instead.
