# Story: Vercel Deploy + Submission Package

**ID:** story-vercel-deploy
**Epic:** Epic 6 — Deploy + Demo Docs
**Depends on:** story-generative-ui-components, story-task-ledger-mcp-tools
**Written:** 2026-05-28 (was referenced by epics.md but missing)

---

## User story

As a hackathon judge,
I want a live demo URL and a README that lets me both use the web app and add the MCP server to my own client,
So that I can verify the project end-to-end on Portaldot without building anything locally.

---

## Acceptance criteria (BDD)

```
Given packages/web is the Vercel project root
When the repo is connected to Vercel and deployed
Then the production URL loads the chat UI and connects to Portaldot (env-configured network)

Given the deployment is live
When `curl -sS https://<app>.vercel.app/api/mcp` is hit with an MCP initialize request
Then it returns a valid MCP JSON-RPC response (the HTTP MCP endpoint is reachable)

Given the web app is open
When a judge runs the 3-tier demo (read balance → transfer w/ wallet sign → create task on the ink! contract)
Then all three succeed against the configured network with real tx hashes (no mocks)

Given the README
When a judge reads the quickstart
Then it contains: live demo URL, deployed Task Ledger contract address (real, not 0x000…),
  the one-line `claude mcp add` command, and a 3-step "use from any MCP client" guide

Given submission requirements
Then the repo has: open-source LICENSE, README, demo video link, and the ink! contract source is public
```

---

## File modification map

- `packages/web/` — Vercel project root; `vercel.json` if needed (build command `pnpm build --filter web`, output handled by Next.js)
- Vercel env vars: `ANTHROPIC_API_KEY`, `PORTALDOT_RPC_URL`, `TASK_LEDGER_CONTRACT_ADDRESS`, `MCP_SERVER_URL` (self / same-origin `/api/mcp`)
- `README.md` (root) — NEW/UPDATE — pitch, demo URL, contract address, MCP install quickstart, architecture diagram, dev setup
- `packages/skills/portaldot/SKILL.md` — cross-client install instructions (one-line add for Claude Code / Cursor / Desktop)
- `LICENSE` — NEW — MIT

---

## Shell verification

```bash
# Local prod build parity
pnpm build
# After Vercel deploy:
curl -sS -X POST https://<app>.vercel.app/api/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"curl","version":"0"}}}' | head -c 300
grep -E "vercel.app|TASK_LEDGER" README.md
```

---

## Notes

- Deploy is driven by Vercel's Git integration, not a GitHub Actions deploy step — CI only verifies (see `story-ci-cd`).
- The MCP HTTP endpoint (`/api/mcp`) and the web chat (`/api/chat`) ship in the same Next.js app (same-origin, no CORS).
- README must make the **MCP server the headline** ("first MCP server for Portaldot — any AI agent can transact"), with the web app as the no-install demo.
- Demo video: record the 3-tier flow (read → write/sign → contract) on the configured network; if mainnet POT is unavailable, devnet is acceptable and stated honestly.
- Network is one env var: demo can flip devnet↔mainnet via `PORTALDOT_RPC_URL`.
