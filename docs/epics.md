# Epics — portaldot-mcp

**Project:** portaldot-mcp  
**Dispatch order:** Sequential (each epic depends on the previous)  

> ⚠️ **Reconciled 2026-05-28 — read with [`architecture-decisions.md`](./architecture-decisions.md) (canonical).** Changes vs the 2026-05-26 plan:
> - Package names: **`packages/core`** (was `packages/mcp-server`) + **`packages/mcp`** (thin wrapper) + **`packages/web`** (was `apps/web`) + **`packages/skills/portaldot`**.
> - Epic 1 (Foundation) now also includes **CI/CD + repo enforcement** → `story-ci-cd` (GitHub Actions) and the day-0 CLAUDE.md / green-light / Stop-hook setup.
> - Epic 6 deploy story is **`story-vercel-deploy`** (now written; was missing).
> - AI SDK **v5** throughout. Chain lib **`@polkadot/api`** in core AND web. Web wallet = `@polkadot/extension-dapp` (no `use-inkathon`).
> - "Estimated build time" removed — per Abu, deadline is not a constraint; build quality-first.

---

## Epic 1 — Foundation (1.5h)

**Business value:** A deployable monorepo skeleton with Portaldot chain connectivity verified. No feature code yet — just proven infrastructure.

**Stories:**
- `story-monorepo-setup` (0.75h) — pnpm monorepo, Next.js app, MCP server package, CLAUDE.md, green-light.sh
- `story-chain-connection` (0.75h) — `@polkadot/api` connects to Portaldot mainnet + local dev node, runtime types verified

**Dependencies:** None  
**Gate:** `pnpm build` exits 0, `packages/mcp-server/src/chain/connection.ts` connects to `wss://mainnet.portaldot.io`

---

## Epic 2 — MCP Read Tools (1.5h)

**Business value:** An AI agent can query Portaldot chain state using natural language. Three read-only tools — no wallet required.

**Stories:**
- `story-mcp-read-tools` (1.5h) — `portaldot_get_balance`, `portaldot_get_block_info`, `portaldot_estimate_fee` MCP tools with real chain data

**Dependencies:** Epic 1 complete  
**Gate:** All three tools return real data from `wss://mainnet.portaldot.io` (or local dev node), tested with Jest

---

## Epic 3 — Wallet + Transfer (2h)

**Business value:** An AI agent can execute real POT transfers, signing via browser wallet or auto-generated keypair. Unlocks the core "send value" use case.

**Stories:**
- `story-wallet-integration` (1h) — `useInkathon` + `@polkadot/extension-inject` browser wallet, auto-keypair generation CLI mode
- `story-mcp-write-tools` (1h) — `portaldot_transfer` MCP tool, signs correctly in both modes, broadcasts real tx

**Dependencies:** Epic 2 complete  
**Gate:** `portaldot_transfer` successfully broadcasts a signed transfer extrinsic (local dev node Alice→Bob)

---

## Epic 4 — AI Chat Interface (2h)

**Business value:** Users type natural language in a browser and the AI executes Portaldot operations. The core demo moment.

**Stories:**
- `story-ai-chat-interface` (1h) — Vercel AI SDK `useChat`, MCP client HTTP transport, `/api/chat` route, Claude claude-sonnet-4-6 intent dispatch
- `story-generative-ui-components` (1h) — BalanceCard, TransferCard (preview + confirm states), BlockInfoCard, WalletConnect component

**Dependencies:** Epic 3 complete  
**Gate:** Chat UI renders real tool result cards from live MCP calls; wallet connect / disconnect works with Talisman or SubWallet

---

## Epic 5 — ink! Task Ledger (2.5h)

**Business value:** Mandatory eligibility gate — ink! contract deployed on Portaldot using POT as gas. Demonstrates the AI agent executing a contract call, completing the Track 4 story.

**Stories:**
- `story-ink-task-ledger` (1.5h) — ink! v5 Agent Task Ledger contract, compiled WASM + JSON metadata, deployed on local dev node (mainnet if POT available), address in env
- `story-task-ledger-mcp-tools` (1h) — `portaldot_deploy_contract`, `portaldot_call_contract`, `portaldot_read_contract` MCP tools; TaskCreatedCard + TaskListCard generative UI components

**Dependencies:** Epic 3 complete (contract deploy needs signing)  
**Gate:** `portaldot_call_contract` successfully creates a task on the deployed contract and `portaldot_read_contract` returns it

---

## Epic 6 — Deploy + Demo Docs (1h)

**Business value:** Live demo URL on Vercel, README with quickstart for AI agents, and a clear submission package.

**Stories:**
- `story-vercel-deploy` (1h) — Vercel deployment config, environment variables wired, README with deployed contract address + demo URL + 3-step MCP quickstart

**Dependencies:** Epics 1–5 complete  
**Gate:** `curl https://portaldot-mcp.vercel.app/api/mcp` returns 200, README has real contract address (not 0x000...), Vercel preview URL works

---

## Dispatch order (sprint-status.yaml)

```
story-monorepo-setup        → PENDING
story-chain-connection      → PENDING (depends: story-monorepo-setup)
story-mcp-read-tools        → PENDING (depends: story-chain-connection)
story-wallet-integration    → PENDING (depends: story-mcp-read-tools)
story-mcp-write-tools       → PENDING (depends: story-wallet-integration)
story-ai-chat-interface     → PENDING (depends: story-mcp-write-tools)
story-generative-ui-components → PENDING (depends: story-ai-chat-interface)
story-ink-task-ledger       → PENDING (depends: story-mcp-write-tools)
story-task-ledger-mcp-tools → PENDING (depends: story-ink-task-ledger)
story-vercel-deploy         → PENDING (depends: story-generative-ui-components, story-task-ledger-mcp-tools)
```

Stories `story-ai-chat-interface` and `story-ink-task-ledger` can run in parallel (both depend on Epic 3 but not each other).
