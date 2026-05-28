# Architecture — portaldot-mcp

**Project:** portaldot-mcp  
**Stack locked:** 2026-05-26 · **Superseded in part 2026-05-28**

> ⚠️ **CANONICAL SOURCE = [`architecture-decisions.md`](./architecture-decisions.md).** Where this 2026-05-26 doc conflicts with it, the decisions doc wins. Specifically overridden: **AI SDK v5** (not v6 — v6 is beta); **`@polkadot/api` on the web too** with `@polkadot/extension-dapp` (not PAPI, not `use-inkathon`); monorepo is **`packages/{core,mcp,web,skills}`** (not `apps/web` + `packages/mcp-server`); write tools are **server-signed only in MCP-client context**, browser signs in the web context. The MCP tool list, ink! contract shape, banned-patterns, and Context7 rule below remain valid.

---

## Stack

| Layer | Choice | Version | Rationale |
|---|---|---|---|
| Language | TypeScript | 5.x | Type-safe, Vercel-native, aligns with aibtcdev reference |
| Monorepo | pnpm workspaces | 9.x | Single `pnpm install`, shared deps |
| Frontend | Next.js App Router | 14.x | Vercel-first, RSC + streaming support |
| AI SDK | Vercel AI SDK | 6.x | `useChat` hook, generative UI tool components, `@ai-sdk/mcp` client |
| MCP SDK | `@modelcontextprotocol/sdk` | latest | Official MCP server implementation |
| MCP Server (Vercel) | `mcp-handler` | latest | Drops a `/api/mcp` HTTP endpoint into Next.js |
| Chain | `@polkadot/api` | 12.x | Official Substrate JS library, works on any Substrate chain |
| Wallet (browser) | `@polkadot/extension-inject` | latest | Standard `window.injectedWeb3` interface |
| Wallet hooks | `useInkathon` | latest | React hooks for Substrate + wallet connection |
| Contract lang | ink! v5 | rustup + `cargo-contract` | Portaldot contracts pallet is WASM-based |
| UI components | shadcn/ui + Tailwind CSS | latest | Productized component set |
| Deploy | Vercel | — | HTTP MCP endpoint + frontend in one project |
| LLM | Claude claude-sonnet-4-6 | — | Intent parsing + tool dispatch |

---

## Repo structure

```
portaldot-mcp/
├── apps/
│   └── web/                         # Next.js frontend
│       ├── app/
│       │   ├── page.tsx             # Main chat page
│       │   ├── api/
│       │   │   ├── chat/route.ts    # Vercel AI SDK chat endpoint
│       │   │   └── mcp/route.ts     # MCP HTTP endpoint (mcp-handler)
│       │   └── layout.tsx
│       ├── components/
│       │   ├── chat/
│       │   │   ├── ChatInterface.tsx
│       │   │   ├── MessageList.tsx
│       │   │   └── InputBar.tsx
│       │   ├── tools/               # Generative UI tool result cards
│       │   │   ├── BalanceCard.tsx
│       │   │   ├── TransferCard.tsx
│       │   │   ├── BlockInfoCard.tsx
│       │   │   └── TaskListCard.tsx
│       │   └── wallet/
│       │       ├── WalletConnect.tsx
│       │       └── WalletStatus.tsx
│       ├── lib/
│       │   ├── mcp-client.ts        # @ai-sdk/mcp StreamableHTTPClientTransport
│       │   ├── polkadot.ts          # @polkadot/api chain connection
│       │   └── wallet.ts            # injectedWeb3 / auto-wallet helpers
│       └── package.json
├── packages/
│   └── mcp-server/                  # Standalone MCP server (also used by web/api/mcp)
│       ├── src/
│       │   ├── index.ts             # stdio transport entry
│       │   ├── server.ts            # MCP server instance
│       │   ├── tools/
│       │   │   ├── balance.ts       # portaldot_get_balance
│       │   │   ├── transfer.ts      # portaldot_transfer
│       │   │   ├── block.ts         # portaldot_get_block_info
│       │   │   ├── fee.ts           # portaldot_estimate_fee
│       │   │   ├── contract-deploy.ts  # portaldot_deploy_contract
│       │   │   ├── contract-call.ts    # portaldot_call_contract
│       │   │   └── contract-read.ts    # portaldot_read_contract
│       │   └── chain/
│       │       ├── connection.ts    # SubstrateConnection singleton
│       │       └── keypair.ts       # auto-wallet (generate on first run, store in .env)
│       └── package.json
├── contracts/
│   └── task-ledger/                 # ink! Agent Task Ledger
│       ├── lib.rs                   # contract source
│       ├── Cargo.toml
│       └── deploy/
│           ├── deploy.py            # Python deploy script using substrate-interface
│           └── README.md
├── CLAUDE.md
├── .claude/
│   ├── settings.json
│   └── scripts/green-light.sh
└── pnpm-workspace.yaml
```

---

## MCP tools — full list

| Tool name | Input | Output | Signs tx? |
|---|---|---|---|
| `portaldot_get_balance` | `address: string` | `{free, reserved, total, formatted}` | No |
| `portaldot_transfer` | `to: string, amount: string, from?: string` | `{txHash, blockHash, fee}` | Yes (via wallet or auto-key) |
| `portaldot_get_block_info` | `blockNumber?: number` | `{number, hash, timestamp, extrinsics[]}` | No |
| `portaldot_estimate_fee` | `to: string, amount: string, from: string` | `{fee, feePOT}` | No |
| `portaldot_deploy_contract` | `wasmPath: string, metadataPath: string, constructorArgs: object` | `{contractAddress, txHash}` | Yes |
| `portaldot_call_contract` | `contractAddress: string, method: string, args: object` | `{txHash, events[]}` | Yes |
| `portaldot_read_contract` | `contractAddress: string, method: string, args: object` | `{result}` | No |

---

## ink! Agent Task Ledger contract

Location: `contracts/task-ledger/lib.rs`

```rust
// Minimal interface (full spec in story-ink-task-ledger.md)
#[ink::contract]
mod task_ledger {
    create_task(description: String) -> u32   // returns task_id
    complete_task(task_id: u32) -> ()
    get_tasks(owner: AccountId) -> Vec<Task>
    get_task(task_id: u32) -> Option<Task>
}

struct Task {
    id: u32,
    description: String,
    completed: bool,
    owner: AccountId,
    created_at: u64,
}
```

**Deployment:** `cargo contract build` → WASM + JSON metadata → deploy via `contracts/task-ledger/deploy/deploy.py` using `substrate-interface` (Python SDK). Deployed address stored in `TASK_LEDGER_CONTRACT_ADDRESS` env var.

---

## Dual wallet mode (aibtcdev pattern)

```
Browser mode:  window.injectedWeb3 → Talisman/SubWallet → signs tx in popup
CLI/agent mode: PORTALDOT_SEED_PHRASE env var → Keypair.fromUri() → signs tx headlessly
```

On first server start (CLI mode), if `PORTALDOT_SEED_PHRASE` is not set:
1. Generate new keypair via `mnemonicGenerate()` from `@polkadot/util-crypto`
2. Write to `.env` as `PORTALDOT_SEED_PHRASE=...`
3. Print address to stdout
4. Server uses this keypair for all unsigned tool calls

Browser mode: auto-wallet is never used. All tx signing goes through `signAndSend()` via the injected extension.

---

## Chain connection config

```typescript
// packages/mcp-server/src/chain/connection.ts
const PORTALDOT_MAINNET = 'wss://mainnet.portaldot.io'
const PORTALDOT_LOCAL   = 'ws://127.0.0.1:9944'

const api = await ApiPromise.create({
  provider: new WsProvider(process.env.PORTALDOT_RPC_URL ?? PORTALDOT_MAINNET),
  types: {},  // default Substrate types are sufficient
})
```

---

## ADRs

### ADR-1: TypeScript over Python for MCP server
**Decision:** `@polkadot/api` TypeScript, not `substrate-interface` Python  
**Why:** Vercel deployment requires Node.js runtime. A Python subprocess sidecar would break cold-start behavior and add deploy complexity. `@polkadot/api` covers identical functionality.

### ADR-2: `@polkadot/api` over `polkadot-js/common`
**Decision:** Use `@polkadot/api` v12 directly  
**Why:** `useInkathon` wraps it with React hooks for the wallet layer; `@polkadot/api` handles raw chain calls in the MCP server. Same underlying lib, right abstraction level per context.

### ADR-3: ink! Task Ledger deployed, not mocked
**Decision:** Real ink! WASM deployment on Portaldot (local dev node for development, mainnet if POT accessible)  
**Why:** Judging eligibility requires "Portaldot Native Deployment using POT as gas." §14 rule: no mocks in hot path.

### ADR-4: MCP HTTP transport for Vercel, stdio for CLI
**Decision:** Single `packages/mcp-server` exported in two modes  
**Why:** stdio mode = any AI agent can `claude mcp add` it as a local server. HTTP mode = accessible from browser `@ai-sdk/mcp` client without CORS issues (same-origin on Vercel).

### ADR-5: `mcp-handler` for the Vercel endpoint
**Decision:** Use `mcp-handler` npm package instead of raw MCP SDK HTTP transport  
**Why:** `mcp-handler` is specifically designed for Vercel Edge/Node API routes. Handles session management and streaming correctly.

---

## Context7 rule (mandatory for coding agent)

Before coding anything from scratch, run:
```
mcp__context7__resolve-library-id <library>
mcp__context7__query-docs <id> <relevant-topic>
```

Required lookups before coding:
- `@polkadot/api` — before writing any chain query/extrinsic
- `@modelcontextprotocol/sdk` — before writing MCP tool handlers
- `@ai-sdk/mcp` — before writing the MCP client in Next.js
- `mcp-handler` — before writing the `/api/mcp` route
- `useInkathon` — before writing wallet integration
- `@polkadot/extension-inject` — before writing `window.injectedWeb3` code
- `ink!` — before writing the contract

---

## Key library references (verified pre-build)

| Library | Reference |
|---|---|
| `@polkadot/api` | https://polkadot.js.org/docs/api |
| `@polkadot/extension-inject` | https://github.com/polkadot-js/extension |
| `useInkathon` | https://github.com/scio-labs/use-inkathon |
| `@ai-sdk/mcp` | https://sdk.vercel.ai/docs/ai-sdk-core/mcp-tools |
| `mcp-handler` | https://github.com/vercel-labs/mcp-handler |
| `@modelcontextprotocol/sdk` | https://github.com/modelcontextprotocol/typescript-sdk |
| aibtcdev reference | https://github.com/aibtcdev/aibtc-mcp-server (Abu's fork: Blockchain-Oracle/aibtc-mcp-server) |
| Portaldot docs | https://portaldot-dev.readthedocs.io/en/latest/ |

---

## Banned patterns (§14 + anti-slop)

- NO `Math.random()` for tx hashes or balances — must be real chain data
- NO `mock`, `fake`, `dummy`, `hardcoded`, `simulated` in any hot path
- NO `bg-gradient-to-br from-purple-500 to-blue-500` default AI gradient
- NO Inter font alone — use Geist (Next.js default) + mono for addresses
- NO inline styles on components — Tailwind classes only
- NO `any` TypeScript types on tool inputs/outputs — use generated types from `@polkadot/types`
- NO polling faster than 3s — chain finality is ~6s on Portaldot

---

## Environment variables

```bash
# Chain
PORTALDOT_RPC_URL=wss://mainnet.portaldot.io   # override to ws://127.0.0.1:9944 for local dev

# Wallet (CLI/agent mode)
PORTALDOT_SEED_PHRASE=                          # auto-generated on first run if not set

# Contracts (filled after deployment)
TASK_LEDGER_CONTRACT_ADDRESS=

# AI
ANTHROPIC_API_KEY=

# Optional: set to local dev node for offline demo
NODE_ENV=development
```
