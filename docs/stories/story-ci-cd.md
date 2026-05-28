# Story: CI/CD (GitHub Actions)

**ID:** story-ci-cd
**Epic:** Epic 1 — Foundation
**Depends on:** story-monorepo-setup
**Written:** 2026-05-28

---

## User story

As the builder,
I want CI that runs the green-light checks on every push and PR,
So that a broken build, lint error, type error, or failing test can never be merged or submitted unnoticed.

---

## Acceptance criteria (BDD)

```
Given .github/workflows/ci.yml exists
When a commit is pushed to any branch or a PR is opened
Then CI checks out, sets up pnpm + Node 20 with pnpm cache, runs `pnpm install --frozen-lockfile`
And runs build, lint, typecheck, and test as a single job
And the job exits non-zero if any step fails

Given the CI workflow runs
When all four steps pass
Then the job is green and the commit is mergeable

Given the contract is added later (Epic 5)
When contracts/task-ledger exists
Then a SEPARATE optional job builds the ink! contract (Rust toolchain + cargo-contract) without blocking the main JS job
```

---

## File modification map

- `.github/workflows/ci.yml` — NEW — main CI workflow (below)
- `.github/actions/setup/action.yml` — NEW (optional) — composite: pnpm/action-setup + setup-node(cache: pnpm) + install
- `package.json` (root) — UPDATE — ensure `build`/`lint`/`typecheck`/`test` scripts exist and run across the workspace

---

## Workflow shape (lightweight, no Turbo unless the repo outgrows it)

```yaml
name: CI
on:
  push:
  pull_request:
permissions:
  contents: read
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
```

Optional later job (Epic 5):
```yaml
  contract:
    runs-on: ubuntu-latest
    if: hashFiles('contracts/task-ledger/Cargo.toml') != ''
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - run: cargo install cargo-contract --locked || true
      - run: cd contracts/task-ledger && cargo contract build
```

---

## Notes

- Keep it ONE job for the JS side — affected-only/Turbo filtering is overkill at this size; revisit only if CI exceeds ~3 min.
- Node 20 LTS in CI even though local dev is Node 25 (avoid bleeding-edge CI flakiness).
- No deploy step here — Vercel deploys via its own Git integration (see `story-vercel-deploy`). CI only verifies.
- Secrets (`ANTHROPIC_API_KEY`) are NOT needed in CI — tests must not call the live LLM; mock it. Chain connection tests may hit the public mainnet WSS read-only (no key needed) but should be resilient/skippable if the node is unreachable in CI.
