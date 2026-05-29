# Deployment runbook

Two shippable artifacts from this monorepo:

| Artifact | Where | How |
|---|---|---|
| **Web app** (`packages/web`) | Vercel | Next.js host, mainnet RPC + LLM key as secrets |
| **MCP server** (`packages/mcp`) | npm | unscoped `portaldot-mcp`, run via `npx` in any MCP client |

**Locked decisions**
1. npm package name: **unscoped `portaldot-mcp`** (clean `npx`, no org).
2. Packaging: **bundle `@portaldot-mcp/core` into the published `portaldot-mcp`** (one self-contained package; `@polkadot/*` stay as runtime deps). Publishing `core` separately is the fallback if it ever needs to be reusable.
3. CI: **build / lint / typecheck / unit only**; live-chain tests stay local-only (too slow/flaky against mainnet in CI).

Prod chain = **`wss://mainnet.portaldot.io`** (already the `.env.example` default; reads verified against it).

---

## Phase A — Pre-deploy prep (local, safe; Claude can do)
- Gate the live **write** tests so they don't run without a node:
  - `transfer.test.ts`, `watch-batch.test.ts`, `tokens.test.ts` → wrap in `describe.skipIf(!process.env.PORTALDOT_DEV_TESTS)` (same pattern as `staking-identity` / `proxy-bounties`).
  - Effect: `pnpm test` / CI is green without a local node; opt-in locally with `PORTALDOT_DEV_TESTS=1` + node on `:9944`.
- Confirm `green-light` still green locally (with the node up + `PORTALDOT_DEV_TESTS=1`).

## Phase B — Web → Vercel (needs your Vercel account)
1. Import `Blockchain-Oracle/portaldot-mcp` in Vercel.
2. **Root Directory = `packages/web`**, Framework = Next.js, package manager = pnpm. Confirm the workspace install resolves `@portaldot-mcp/core` (transpiled from source via `transpilePackages`).
3. Environment Variables (all environments):
   - `PORTALDOT_RPC_URL = wss://mainnet.portaldot.io`
   - `NEXT_PUBLIC_PORTALDOT_RPC_URL = wss://mainnet.portaldot.io`
   - one of `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `XAI_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY`
   - optional `AI_MODEL` (e.g. `anthropic:claude-sonnet-4-6`)
   - **do NOT set `PORTALDOT_SEED_PHRASE`** — the web app signs in the browser.
4. Deploy → smoke test: landing renders; `/app` reads (network/block/validators) return live mainnet data; wallet connect + transfer **preview** works (actual send needs the user's mainnet POT).
5. Known caveat: `/api/chat` is a Node serverless function; it opens a fresh WS to mainnet per cold start (a few seconds' latency on cold invocations). Optimize later with connection reuse / a warmed instance if needed.

## Phase C — MCP server → npm ✅ SHIPPED (`portaldot-mcp@0.1.0`)
As built: renamed `@portaldot-mcp/mcp` → unscoped **`portaldot-mcp`** (public, no org); removed `private`; added `files: ["dist"]`, `repository`, `license`, `engines`, `keywords`. Core is **bundled** via `tsup` `noExternal: ["@portaldot-mcp/core"]` (kept as a workspace `devDependency`); `@polkadot/*` + `pino` + `zod` + the MCP SDK stay external and are declared in `dependencies`. `dist/index.js` keeps the `#!/usr/bin/env node` shebang.
- Re-publish a new version: bump `version` in `packages/mcp/package.json`, then `pnpm --filter @portaldot-mcp/core build && pnpm --filter portaldot-mcp publish --no-git-checks`.
- Install: `claude mcp add portaldot -- npx -y portaldot-mcp`.
- Reads work unfunded. **Writes** (transfer/mint) need a funded `PORTALDOT_SEED_PHRASE` (auto-generated wallet → fund it with POT).

## Phase D — CI green (`.github/workflows/ci.yml` already exists)
- Ensure it runs `pnpm install --frozen-lockfile` → build / lint / typecheck / test, with `PORTALDOT_DEV_TESTS` **unset** (so live write-tests skip per Phase A).
- Live-chain read tests (`read-tools`, `connection`, `utils-account`) hit mainnet — keep them out of CI too if they prove flaky; CI should rely on pure-unit coverage (format, address utils). Live tests = local/manual.
- Optional: a separate non-blocking job for `cargo contract build` (ink!).

## Phase E — Mainnet & beyond (ongoing)
- Fund the MCP headless wallet (`~/.portaldot-mcp/config.json` address) to demo MCP-side writes.
- Custom domain + analytics on Vercel.
- **Task Ledger (ink!) stays unavailable on mainnet** — the node rejects ink!5 contract metadata (documented carve-out: deploys to `substrate-contracts-node` only). Revisit when Portaldot's contracts pallet is updated; until then task tools error gracefully.

---

### Who does what
- **Claude (local, no credentials):** Phase A, the Phase C code prep (manifest, tsup, `npm pack` dry-run), Phase D workflow edits.
- **You (account-gated):** Vercel import + env (B), `npm login` + `npm publish` (C), wallet funding (E).
