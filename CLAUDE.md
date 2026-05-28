# portaldot-mcp

The first MCP server for **Portaldot** (Substrate L0, token POT, ss58:42, 14 decimals). One product, two surfaces:
- **`packages/mcp`** — MCP server for any client (Claude Code, console, Cursor). Headless signing via an auto-generated key.
- **`packages/web`** — Next.js + AI SDK v5 generative-UI chat for humans. Browser injected-wallet signing; the server never holds keys.
- **`packages/core`** — the shared `@polkadot/api` brain (tools, wallet, contract, format). No `next`, no MCP SDK.
- **`packages/skills/portaldot`** — one-line cross-client install. **`contracts/task-ledger`** — ink! v5 (the POT-gas deploy gate).

Canonical architecture: **`docs/architecture-decisions.md`**. Research: `research/portaldot-online-s1/CONTEXT.md`.

## Commands
- `pnpm dev:mcp` — run MCP server (tsx watch, stdio)
- `pnpm dev:web` — run web app
- `pnpm build` / `pnpm lint` / `pnpm typecheck` / `pnpm test`
- `bash .claude/scripts/green-light.sh` — the one gate. Exit 0 = done. Never declare done while red.

## Stack (locked — do not drift)
- TypeScript + pnpm workspaces, strict, ESM (`NodeNext`)
- Chain: **`@polkadot/api`** + `@polkadot/api-contract` (works against served metadata, zero custom types). NOT PAPI, NOT `use-inkathon`.
- Web wallet: **`@polkadot/extension-dapp`** (`web3Enable`/`web3Accounts`/`web3FromSource`)
- AI: **Vercel AI SDK v6** (now stable: `ai@6`, `@ai-sdk/react@3`) — `useChat` + `DefaultChatTransport`, typed `tool-${name}` parts → React cards, `streamText` + `toUIMessageStreamResponse`, client tools via `addToolOutput`. NOT RSC `streamUI`. Next 16, React 19.
- MCP: `@modelcontextprotocol/sdk` (stdio) + Streamable HTTP for the web route
- Contract: ink! v5, real `cargo contract build`
- Networks: one env var `PORTALDOT_RPC_URL` (devnet `ws://127.0.0.1:9944` ↔ mainnet `wss://mainnet.portaldot.io`)

## Conventions
- One file per tool in `packages/core/src/tools/`. **zod** input schemas. Return `ok(data)` / `err(msg)`.
- **pino** logger only — never `console.log`.
- Read-only tools wrapped in `withCache()` (short TTL). Chain finality ~6s — don't poll faster than 3s.
- Auto-wallet: generate on first run, persist to `~/.portaldot-mcp/config.json`. **Never commit a key / seed.**
- Money is `bigint` raw units; format to POT by dividing 10^14 at the edge only. SS58 prefix 42. Truncate addresses `5F3sA…utQY`.

## Banned (anti-slop)
- No mocked/`Math.random()` chain data in any hot path — real chain or fail loudly.
- No `any` on tool inputs/outputs — use `@polkadot/types` / zod-inferred types.
- No `bg-gradient-to-br from-purple-* to-blue-*` AI-default gradients. Geist Sans body, **mono for all addresses/hashes**.
- No inline styles — Tailwind only. Cards `rounded-xl`, not `rounded-full`.

## Process
- **Every tool ships with: impl (`core`) + a REAL end-to-end test (live chain, no mocks) + a generative-UI card (`web`). No tool is "done" without all three.**
- Spec before code: stories in `docs/stories/`. Loop on green-light, not vibes.
- Frontend: pull a real anchor (sahil-ui-mining) before writing UI. Diff against `screenshots/anchor/`.
- Before "done": fresh-context cross-review. 3 repeated errors → stop and reassess.
- No deadline-driven scope cuts. Build the best version.
