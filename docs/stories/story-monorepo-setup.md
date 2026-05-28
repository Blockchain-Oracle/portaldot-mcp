# Story: Monorepo Setup

**ID:** story-monorepo-setup
**Epic:** Epic 1 — Foundation
**Depends on:** None
**Reconciled:** 2026-05-28 to `architecture-decisions.md` (canonical)

---

## User story

As the builder starting portaldot-mcp,
I want a working pnpm monorepo with the `core` and `mcp` packages bootstrapped and a green-light shell,
So that every later feature lands in a proven skeleton that builds, lints, type-checks, and tests with one command.

---

## Acceptance criteria (BDD)

```
Given a fresh checkout of the repo
When `pnpm install` runs from root
Then it exits 0 with no peer-dep errors and links all workspace packages

Given the repo is installed
When `pnpm build` runs from root
Then packages/core and packages/mcp compile with strict TypeScript, exit 0

Given the repo is installed
When `pnpm -C packages/mcp start` (or `node packages/mcp/dist/index.js`) runs
Then it logs "portaldot-mcp running on stdio" via pino and stays up

Given the repo is installed
When `.claude/scripts/green-light.sh` runs
Then it runs build + lint + typecheck + test and exits 0 (and is executable)

Given the repo root
When `cat CLAUDE.md` runs
Then a lightweight (~80 line) CLAUDE.md exists with stack identity, top commands, and banned patterns
```

---

## File modification map (locked stack)

- `pnpm-workspace.yaml` — NEW — `packages: ["packages/*"]`
- `package.json` (root) — NEW — scripts: `build`, `lint`, `typecheck`, `test`, `dev`, `dev:mcp`, `dev:web`; `packageManager: pnpm@10`; devDeps: `typescript`, `tsx`, `vitest`, `eslint`, `@typescript-eslint/*`, `prettier`
- `tsconfig.base.json` (root) — NEW — strict, `module: NodeNext`, `target: ES2022`, composite project refs
- `packages/core/` — NEW — framework-agnostic brain
  - `package.json` — deps: `@polkadot/api`, `@polkadot/api-contract`, `@polkadot/util`, `@polkadot/util-crypto`, `@polkadot/keyring`, `zod`, `pino`
  - `src/chain/{connection,wallet,format,contract}.ts` — connection/format implemented here in story-chain-connection; stubs created now
  - `src/lib/{logger,cache,result,types}.ts` — `logger` (pino), `result` (`ok()`/`err()`), `cache` (TTL wrapper), shared types
  - `src/tools/` — empty for now (one file per tool added in later stories)
  - `src/registry.ts` — `registerAllTools(server)` — empty registration for now
  - `src/index.ts` — barrel exports
- `packages/mcp/` — NEW — thin transport wrapper (NO `next` dep)
  - `package.json` — deps: `@modelcontextprotocol/sdk`, `@portaldot-mcp/core` (workspace:*)
  - `src/index.ts` — stdio transport entry, logs "portaldot-mcp running on stdio", calls `registerAllTools`
- `CLAUDE.md` — NEW — lightweight (~80 lines)
- `.claude/scripts/green-light.sh` — NEW — `set -e`; build → lint → typecheck → test; `✅ green`
- `.claude/settings.json` — NEW — Stop hook (refuses exit while green-light is red); keep minimal
- `.github/workflows/ci.yml` — NEW — see `story-ci-cd`
- `.gitignore`, `.eslintrc.cjs`, `.prettierrc` — NEW
- `.env.example` — NEW — `PORTALDOT_RPC_URL`, `ANTHROPIC_API_KEY`, `TASK_LEDGER_CONTRACT_ADDRESS`

---

## Shell verification

```bash
pnpm install --frozen-lockfile || pnpm install
pnpm build && echo "build $?"
pnpm lint && pnpm typecheck && echo "checks ok"
timeout 5 node packages/mcp/dist/index.js 2>&1 | grep "running on stdio"
bash .claude/scripts/green-light.sh && echo "GREEN"
```

---

## Notes

- Scoped package names: `@portaldot-mcp/core`, `@portaldot-mcp/mcp`. `packages/web` and `packages/skills/portaldot` are scaffolded in their own stories.
- `core` must NOT depend on `next` or `@modelcontextprotocol/sdk` — it's the pure chain/tool brain so it can be consumed by both the MCP wrapper and the Next.js web app.
- Tool convention (carried forward): one file per tool, **zod** input schemas, return `ok(data)`/`err(msg)`, **pino** logging (never `console.log`), read-only tools wrapped in `withCache()`.
- CLAUDE.md stays ~80 lines and lightweight (Abu's explicit ask) — stack identity, `pnpm dev`/`build`/green-light, banned patterns (no AI gradients, mono font for addresses, no `any` on tool I/O, real chain data only).
