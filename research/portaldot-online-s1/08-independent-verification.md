# 08 — Independent Verification (Claude, local Mac)

**Date:** 2026-05-28 (3 days to deadline)
**By:** Claude Code, running locally at `/Users/abu/dev/hackathon/pokaldot`
**Purpose:** Abu asked me to do my OWN research on top of the prior agent's gist output, since I'm the one building. This file records what I verified, corrected, and discovered that the gist did not have.

---

## 1. Mainnet is LIVE — verified by direct WebSocket JSON-RPC handshake

The prior research listed mainnet as "verified" from docs only. I connected to it directly:

| RPC method | Result |
|---|---|
| `system_chain` | **"Portaldot Mainnet"** |
| `system_version` | `2.0.0-unknown-x86_64-linux-gnu` |
| `system_properties` | `{ ss58Format: 42, tokenDecimals: 14, tokenSymbol: "POT" }` — matches docs exactly |
| `system_health` | `{ isSyncing: false, peers: 13, shouldHavePeers: true }` |
| `state_getMetadata` | 306 KB metadata hex — full runtime metadata present |

**Implications:**
- `wss://mainnet.portaldot.io` is real, synced, and has 13 peers. Not a ghost endpoint.
- DNS → `47.242.204.5` (Alibaba Cloud, China region — consistent with the Chinese-community signal in phase3).
- 306 KB of metadata means **`@polkadot/api` auto-decodes the entire chain with zero custom types.** It also means **PAPI descriptors can be generated** from this chain (`papi add`).
- This is a plain HTTP probe rejection: hitting `https://mainnet.portaldot.io` with POST returns "WebSocket Protocol Error" — i.e. it is a WS-only RPC port. Use `wss://`, not HTTPS POST.

**Still open:** whether mainnet POT is obtainable to pay gas (no faucet found). Contract deploy + transfer demo may need POT. Fallback = local dev node (Alice prefunded). See §5.

---

## 2. "Pacific MCP / Pacifica MCP" mystery — SOLVED

The prior agent (web-layer-architecture.md §5) could not find "Pacific MCP" and marked it UNVERIFIABLE. It is **`Blockchain-Oracle/pacifica-mcp`** — Abu's own repo (TypeScript, pushed 2026-04-16). The STT rendered "Pacifica" as "Pacific."

It is the reference pattern Abu wants portaldot-mcp to follow. Verified structure:

```
pacifica-mcp/  (pnpm monorepo)
  packages/cli      ← CORE LIB: lib/{api,cache,constants,daemon,format,logger,signing,transforms,types,wallet,ws}.ts
                       + tools/<one-file-per-tool>.ts  + server.ts + cli.ts + __tests__/
  packages/mcp      ← thin MCP server wrapper (stdio), imports from cli
  packages/skills/pacifica  ← cross-client Agent Skill (SKILL.md)
  packages/web      ← Next.js landing page + tool explorer
  packages/docs     ← Nextra docs
```

**Auto-wallet pattern (what Abu meant by "autocreated wallets"):** on first run, generates a wallet at `~/.pacifica-mcp/config.json`; private key never leaves the machine. CLI/agent users get a generated key; no accounts, no API keys. This is the headless-signing half of the dual-wallet model in `docs/architecture.md`.

**Abu's MCP conventions (from pacifica-mcp CLAUDE.md), to reuse:**
- `pino` logger, never `console.log`
- `pnpm add` (never hardcode versions)
- one file per tool; pattern `registerXxxTool(server)` with **zod** schemas
- response pattern `ok(data)` / `err(message)`
- read-only tools wrapped in `withCache()` (5-min TTL)
- signing isolated in `lib/signing.ts`; wallet in `lib/wallet.ts`

**Other Abu MCP repos (he is an MCP-server specialist — ~10 servers):** `aibtc-mcp-server` (the spec's named anchor), `stellar-mcp` (Rust), `kwala-mcp`, `MCPay` (MCP + x402 infra), `stacks-clarity-mcp`, `midnight-mcp`, `mcpvault`, `generated-mcp-frontend`, `graphite-mcp`.

---

## 3. Toolchain gap on this machine

| Tool | State | Note |
|---|---|---|
| node | v25.9.0 | ✅ |
| pnpm | 10.33.0 | ✅ |
| python3 | 3.14.4 | ✅ (for substrate-interface deploy path) |
| **cargo / rustup** | **MISSING** | ⚠️ needed to compile the ink! contract |
| **cargo-contract** | **MISSING** | ⚠️ needed for `cargo contract build` |

Building the ink! Task Ledger requires installing the Rust toolchain + `cargo-contract` (real time + disk cost on a 3-day clock). Alternatives to weigh: (a) install Rust, (b) use a prebuilt ink! `.contract`/`.wasm` artifact (e.g. flipper from use-ink/ink-examples releases) to satisfy the deploy gate, (c) keep the contract truly minimal.

---

## 4. Contradictions in the prior gist the coding agent must resolve BEFORE building

These two files disagree and were never reconciled:

| Decision | `docs/architecture.md` (locked spec) | `research/.../web-layer-architecture.md` (research) |
|---|---|---|
| Chain lib | `@polkadot/api` v12 + `use-inkathon` | **PAPI** (`polkadot-api`) + `@polkadot/extension-dapp` |
| AI SDK | "Vercel AI SDK 6.x" | "AI SDK 5.0 stable; 6.0 adds `needsApproval`" |
| MCP client import | `@ai-sdk/mcp` | `createMCPClient` from `@ai-sdk/mcp` (same) |
| Vercel MCP endpoint | `mcp-handler` | (not addressed) |

My take (for the conversation, not yet locked):
- **Chain lib:** `@polkadot/api` is the safer hackathon pick — the live chain exposes full metadata so it works with **zero** custom config, and `@polkadot/api` has the `ContractPromise` API the ink! tools need. PAPI is technically nicer but needs a descriptor-generation step (`papi add`) against this chain and has thinner contract ergonomics. On a 3-day clock, `@polkadot/api` de-risks. But Abu's pacifica-mcp is Solana (web3.js), so neither is his "house" lib — open question whether he has a Substrate preference.
- **AI SDK version:** verify the actual current stable before pinning (the spec says 6.x, research says 5.x). This needs a live docs check (context7) at build time.

Also: `docs/epics.md` references `story-vercel-deploy` but **that story file is missing** from the gist (only 9 of 10 stories exist). Needs writing or the deploy epic is unspecified.

---

## 5. My read on strategy (for discussion, not a decision)

- **Field check still holds:** 0 public BUIDLs, 189 registered, first season, $3.5k pool, AI track wide open. Thin field = real shot. (phase3 leaned "skip" purely on ROI/$3.5k — that's Abu's call, not mine.)
- **The strongest, most defensible artifact here is the MCP server itself**, packaged the pacifica-mcp way (npm-installable, one-line add to any agent client, auto-wallet). "First MCP server for Portaldot" is a clean, true, novel claim. The generative-UI web app is the *demo skin* on top; the MCP server is the *product*.
- **The mandatory gate** is one ink! contract deployed on Portaldot with POT gas. Keep it minimal (Task Ledger or even flipper-class). Don't let the Rust toolchain become the critical path.
- **Reconcile the monorepo shape to pacifica-mcp** (`packages/cli` core + `packages/mcp` wrapper + `packages/web` + `packages/skills`) rather than the prior spec's `apps/web` + `packages/mcp-server`. Abu's pattern is proven and he packages/publishes this way.

---

## Verification method log

- WSS handshake: Node 25 built-in `WebSocket` global → `wss://mainnet.portaldot.io`, sent 5 JSON-RPC calls, all answered.
- Repo discovery: `gh repo list Blockchain-Oracle` (authed as Blockchain-Oracle) + `gh api .../readme`, `.../CLAUDE.md`, recursive tree.
- DoraHacks page: WebFetch returns 405 (JS-gated); relying on prior `phase1-platform.md` scrape for the gallery/prize/track facts (not re-verified live this session).
