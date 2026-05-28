# Architecture Decisions — portaldot-mcp (researched + locked, 2026-05-28)

This is the **single source of truth** for the build. It supersedes conflicting parts of `architecture.md` and `web-layer-architecture.md`, which were written 2026-05-26 by a prior agent and contained unreconciled contradictions and one wrong version pin. Rationale for each call is from independent research (context7 docs, live chain probe, 2026 ecosystem search) — not copied from a reference repo.

> **Design principle (per Abu):** Reference repos (`pacifica-mcp` etc.) are **inspiration, not templates**. This architecture is designed for the Substrate/ink! + generative-UI domain, not cloned. No deadline-driven scope cuts — build the best version.

---

## The product is TWO surfaces, one core

```
                       ┌──────────────────────────────┐
                       │   packages/core (the brain)   │
                       │  @polkadot/api + api-contract │
                       │  tools · wallet · contract    │
                       └───────────┬──────────┬────────┘
                                   │          │
                 imports ◄─────────┘          └─────────► imports
        ┌────────────────────┐            ┌─────────────────────────────┐
        │  packages/mcp       │            │  packages/web (Next.js)     │
        │  stdio + HTTP MCP   │            │  AI SDK v5 generative UI    │
        │  HEADLESS signing   │            │  BROWSER injected signing   │
        │  (auto-wallet)      │            │  (server NEVER signs)       │
        │  → Claude Code,     │            │  → humans, no MCP client    │
        │    console, Cursor  │            │    needed; MetaMask-style   │
        └────────────────────┘            │    wallet connect           │
                                          └─────────────────────────────┘
```

**"Dual mode" = same tools, two execution contexts, decided by who holds the signer:**
- **MCP client context** (no browser): server signs headlessly with an auto-generated key.
- **Web context** (browser): server only reads / dry-runs / proposes; the **browser** signs the write via the injected extension and broadcasts. The server holds no keys here.

---

## Locked stack

| Layer | Decision | Why (researched) |
|---|---|---|
| Language / mono | TypeScript + pnpm workspaces | matches Abu's house style; one `pnpm install` |
| Chain lib (everywhere) | **`@polkadot/api` + `@polkadot/api-contract`** | Portaldot serves 306 KB metadata → **zero custom types**. `CodePromise`/`ContractPromise` is the mature ink! path. Covers reads, transfer, fee, deploy, call, AND browser injected signing (`web3FromSource().signer`). Verified in polkadot-js docs. |
| Chain lib NOT used | ~~PAPI / Dedot / ReactiveDOT / Typink~~ | trendier in 2026 but all need `papi add`/descriptor generation against an obscure non-registry chain = setup risk for no gain. One lib across both surfaces wins. |
| Browser wallet | `@polkadot/extension-dapp` (`web3Enable`/`web3Accounts`/`web3FromSource`) + a designed multi-wallet connect modal (Talisman/SubWallet/Polkadot.js) | canonical injected-wallet path; lib-agnostic; works directly with `@polkadot/api`. No `use-inkathon` dependency required. |
| AI / generative UI | **Vercel AI SDK v6 (stable)** — `useChat`+`DefaultChatTransport`, typed `tool-${name}` parts → React cards, `streamText`+`toUIMessageStreamResponse`, client tools via `addToolOutput` | At build time (2026-05-28) `pnpm add ai` resolved **v6.0.x stable** (it had been beta days earlier). Built on v6. Next 16 + React 19. RSC `streamUI` is dead — don't use. |
| MCP | `@modelcontextprotocol/sdk`; stdio for clients, Streamable HTTP for the web's server route | stdio = `claude mcp add`; HTTP = same-origin call from Next.js (no CORS) |
| Contract | ink! v5, real `cargo contract build` (Rust toolchain to be installed) | mandatory eligibility gate; strongest Track-4 narrative |
| Networks | **config-driven** `PORTALDOT_RPC_URL` (devnet `ws://127.0.0.1:9944` ↔ mainnet `wss://mainnet.portaldot.io`) | develop on devnet, flip to mainnet via env var; gas/POT is the LAST step |
| Deploy (web) | Vercel | HTTP MCP endpoint + frontend in one project |

---

## Proposed monorepo shape (designed for this domain)

```
portaldot-mcp/
  packages/
    core/                         # framework-agnostic brain
      src/
        chain/{connection,wallet,format,contract}.ts
        tools/{get-balance,transfer,estimate-fee,get-block,
               deploy-contract,call-contract,read-contract,list-tasks}.ts
        lib/{logger,cache,result,types}.ts
        registry.ts               # registerAllTools(server)
    mcp/                          # thin transport wrapper (stdio + HTTP), imports core
    web/                          # Next.js 14, AI SDK v5 generative UI, injected signing
      app/{page.tsx, api/chat/route.ts, api/mcp/route.ts}
      components/{chat,tools,wallet}
      lib/{polkadot.ts, wallet.ts}
    skills/portaldot/             # SKILL.md — one-line cross-client install
  contracts/
    task-ledger/{lib.rs, Cargo.toml, deploy/}   # ink! v5 Agent Task Ledger
  CLAUDE.md  .claude/{settings.json, scripts/green-light.sh}  pnpm-workspace.yaml
```

Conventions carried from Abu's proven work: one file per tool, **zod** schemas, `ok()/err()` response helpers, **pino** logging (never `console.log`), read-only tools wrapped in a small cache, auto-wallet generated on first run at `~/.portaldot-mcp/config.json` (key never leaves the machine).

---

## Corrections applied to the prior spec
1. AI SDK **v5**, not v6 (v6 is beta).
2. `@polkadot/api` for the **web too** (with `@polkadot/extension-dapp`), not PAPI — resolves the `architecture.md` ↔ `web-layer-architecture.md` conflict.
3. Monorepo is `packages/{core,mcp,web,skills}` (not `apps/web` + `packages/mcp-server`) — core/transport split so the same brain serves both surfaces.
4. `story-vercel-deploy` (referenced by `epics.md` but missing) must be (re)written before the deploy epic runs.
5. Write tools are **not** server-signed in the web context — server proposes, browser signs.

## Still external (only Abu can unblock)
- A line to the Portaldot team (Discord/Telegram) to obtain **mainnet POT** for gas, OR confirmation that local-devnet deployment satisfies the gate. Build proceeds on devnet regardless.
