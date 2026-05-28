# PRD — portaldot-mcp

**Project:** portaldot-mcp  
**Hackathon:** Portaldot Mini Hackathon Online Season 1  
**Track:** Track 4 — AI-Powered Onchain Workflows  
**Deadline:** May 31, 2026 00:00 UTC  

---

## Goal

Build `portaldot-mcp` — the first MCP (Model Context Protocol) server for the Portaldot blockchain. It wraps Portaldot chain operations as AI-callable tools and ships with a Next.js web app where users type natural language requests ("check my balance", "send 5 POT to this address", "log a task onchain") and the AI executes them against Portaldot mainnet using their Polkadot browser wallet (Talisman or SubWallet). An ink! Agent Task Ledger contract provides the mandatory native Portaldot deployment required for judging.

---

## One-line pitch

The first MCP server for Portaldot — natural language onchain execution with a browser wallet.

---

## Sponsor-native fit

Directly answers Track 4 criteria: an AI copilot that turns any Portaldot workflow (balance check, transfer, task logging) into a natural-language conversation, using POT as gas via an ink! contract deployed on Portaldot mainnet.

---

## Demo moment (5 steps, judge-walkthrough)

1. **Open the app** at `portaldot-mcp.vercel.app`. Connect Talisman wallet. Status bar shows: "Connected to Portaldot mainnet · Account: 5F3sA… · 42.00 POT"
2. **Type:** "What's my balance?" → AI responds with a balance card: free balance, reserved balance, total. Pulled live from Portaldot mainnet.
3. **Type:** "Send 1 POT to 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" → AI shows a transfer preview card with fee estimate. User clicks "Sign & Send" → Talisman approval popup → confirmed tx hash card with block link.
4. **Type:** "Create a task: Deploy to mainnet" → AI invokes the ink! Task Ledger contract on Portaldot mainnet. Tx confirmed. Response card shows task ID and tx hash.
5. **Type:** "Show my tasks" → AI reads the contract state, returns a task list card. Everything runs via MCP tools. Any Claude or AI agent can use these same tools via stdio or HTTP.

---

## The wow moment

"This is a full MCP server for a real chain — any AI agent in the world can now transact on Portaldot by just calling portaldot_transfer."

---

## Out of scope

- Staking, governance, parachain operations
- Multi-chain routing
- Production key management / HSM
- Mobile app
- Token swaps / DEX
- Historical analytics dashboard
- WebSocket real-time subscriptions in the UI (polling is fine for the demo)

---

## Judging fit analysis

| Criterion | How portaldot-mcp hits it |
|---|---|
| Application Value | Natural language execution removes the dev-facing friction of the Substrate API |
| Tech Innovation | First MCP server for Portaldot; generative UI tool components are novel |
| Market Potential | Every AI agent framework (Claude, Cursor, Windsurf) can now target Portaldot |
| Demo Completeness | 5-step walkthrough is live on mainnet, no mocks |
| Portaldot Native | ink! Agent Task Ledger deployed on mainnet, POT as gas |

---

## Success definition

- MCP server runs in both HTTP mode (Vercel) and stdio mode (local Claude Code)
- Web app demo works end-to-end on Portaldot mainnet (or local dev node if mainnet POT unavailable)
- ink! Agent Task Ledger contract deployed with a real POT tx (even if local dev node)
- All MCP tools return real chain data — no mocked responses anywhere
- README has deployed contract address, demo URL, and 3-step quickstart for AI agent usage
