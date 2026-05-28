# UX Spec — portaldot-mcp

**Project:** portaldot-mcp  
**Surface:** Single-page chat interface (web app)  

---

## Anchor product

**aibtcdev/aibtcdev-frontend** — https://app.aibtc.dev  
**Why:** Identical use case (AI + blockchain MCP tools + browser wallet for Bitcoin). Abu forked the backend (`Blockchain-Oracle/aibtc-mcp-server`). The frontend pattern (chat input + tool result cards + wallet status bar) is proven for this exact flow.

Secondary reference: **Linear.app chat UI** — for the input bar pattern (Cmd+Enter to send, typing indicator, streaming response).

---

## Layout shape

```
┌─────────────────────────────────────────────────────┐
│  portaldot-mcp          [wallet status pill]  [⚙️]  │  ← header (sticky)
├─────────────────────────────────────────────────────┤
│                                                     │
│  [BalanceCard]   [BlockInfoCard]                    │  ← tool result cards (generative UI)
│                                                     │
│  User: "send 1 POT to 5GrwvaEF..."                 │
│  AI: [TransferCard — preview + sign button]         │
│                                                     │
│  User: "create task: deploy to mainnet"             │
│  AI: [TaskCreatedCard — tx hash + task id]          │
│                                                     │
│                                                     │  ← scrollable message list
├─────────────────────────────────────────────────────┤
│  [Type a message... e.g. "check my balance"]  [→]  │  ← input bar (sticky, bottom)
└─────────────────────────────────────────────────────┘
```

Single route: `/`. No navigation. No sidebar. No settings page.

---

## Design tokens

| Token | Value |
|---|---|
| Primary color | `#7B3FE4` (Portaldot purple — extrapolated from logo) |
| Surface bg | `#0F0F14` (near-black) |
| Card bg | `#1A1A24` |
| Card border | `#2D2D3D` |
| Text primary | `#F0F0F5` |
| Text secondary | `#8888A8` |
| Success | `#22C55E` (green-500) |
| Error | `#EF4444` (red-500) |
| Pending | `#F59E0B` (amber-500) |
| Font — body | Geist Sans (Next.js default) |
| Font — addresses | Geist Mono |
| Border radius — cards | `12px` |
| Card padding | `16px` |

---

## Tool result card specs

### BalanceCard
```
┌────────────────────────────────┐
│ 💰 Balance                     │
│ 5F3sA…utQY                     │ ← address, Geist Mono, truncated
│                                │
│ Free:     42.0000 POT          │
│ Reserved:  0.0000 POT          │
│ ────────────────               │
│ Total:    42.0000 POT          │
└────────────────────────────────┘
```

### TransferCard (preview state)
```
┌────────────────────────────────┐
│ 📤 Transfer Preview            │
│ To:    5Grwva…utQY             │
│ Amount: 1.0000 POT             │
│ Fee est: ~0.0001 POT           │
│                                │
│ [Sign & Send]    [Cancel]      │
└────────────────────────────────┘
```

### TransferCard (confirmed state)
```
┌────────────────────────────────┐
│ ✅ Transfer Confirmed           │
│ Tx: 0x1234…abcd                │
│ Block: #1,234,567              │
│ [View on Explorer ↗]           │
└────────────────────────────────┘
```

### TaskCreatedCard
```
┌────────────────────────────────┐
│ 📋 Task Created                │
│ ID: #7                         │
│ "Deploy to mainnet"            │
│ Tx: 0xabcd…1234                │
│ Status: Pending                │
└────────────────────────────────┘
```

### TaskListCard
```
┌────────────────────────────────┐
│ 📋 My Tasks (3)                │
│ #1 ✅ Research done             │
│ #2 ✅ Spec written              │
│ #7 ⏳ Deploy to mainnet        │
└────────────────────────────────┘
```

---

## Wallet status bar (header right)

- **Disconnected:** `[Connect Wallet]` button (purple, pill shape)
- **Connected:** `[●  5F3sA…utQY  42.00 POT  ✕]` — click ✕ to disconnect

---

## Empty state / welcome screen

When no messages exist, show in the center of the message area:
```
portaldot-mcp
The first AI agent gateway for Portaldot.

Try:
  "What's my balance?"
  "Send 1 POT to [address]"
  "Create a task: launch MVP"
  "Show my recent blocks"
```

---

## Streaming behavior

- AI text streams character by character via `useChat` hook
- Tool call in progress: show skeleton card with pulsing animation
- Tool call complete: replace skeleton with real card (no layout shift)
- Wallet approval pending: TransferCard shows spinner on "Sign & Send" button

---

## Route shape

| Route | Purpose |
|---|---|
| `/` | Main chat interface — all functionality |
| `/api/chat` | Vercel AI SDK chat endpoint |
| `/api/mcp` | MCP HTTP endpoint (for external AI agents) |

No other routes needed for the demo.

---

## Banned Tailwind classes (project-specific)

- `bg-gradient-to-br from-purple-500` — no default AI gradients
- `from-blue-500 to-purple-600` — same
- `font-sans` alone on addresses — must use `font-mono` for any chain data
- `text-xs` on address strings — use `text-sm font-mono`
- `rounded-full` on cards — use `rounded-xl` per design tokens

---

## Demo shape rule

The demo must show all three capability tiers in 90 seconds:
1. **Read:** "check balance" → BalanceCard
2. **Write:** "send 0.1 POT to Alice" → TransferCard preview → wallet sign → confirmed card
3. **Contract:** "create a task" → TaskCreatedCard with tx hash

If the judge only sees step 1, the demo fails. All three tiers are required.
