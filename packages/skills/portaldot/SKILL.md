---
name: portaldot
description: Read and transact on the Portaldot blockchain (Substrate L0, token POT) in natural language. Use when asked to check a POT balance, inspect a block, estimate a fee, send POT, or manage tasks on the Agent Task Ledger ink! contract.
---

# Portaldot MCP

This skill connects you to the **Portaldot MCP server** — the gateway for reading and transacting on Portaldot (Substrate L0, token POT, 14 decimals, ss58:42).

## Install (one line)

```bash
# Claude Code
claude mcp add portaldot -- node /path/to/portaldot-mcp/packages/mcp/dist/index.js

# Any MCP client (Cursor, Claude Desktop, Zed, …) — add to its MCP config:
#   { "command": "node", "args": ["/path/to/portaldot-mcp/packages/mcp/dist/index.js"] }
```

Environment:
- `PORTALDOT_RPC_URL` — `wss://mainnet.portaldot.io` (default) or `ws://127.0.0.1:9944` for a local dev node.
- `PORTALDOT_SEED_PHRASE` — optional; auto-generated on first run and stored at `~/.portaldot-mcp/config.json`. Fund this address with POT to send transactions.
- `TASK_LEDGER_CONTRACT_ADDRESS` + `TASK_LEDGER_METADATA_PATH` — to use the task tools.

## Tools

- `portaldot_get_balance` — free / reserved / total POT for an address
- `portaldot_get_block_info` — block number, hash, timestamp, extrinsic count
- `portaldot_estimate_fee` — real runtime fee for a transfer
- `portaldot_transfer` — send POT (signs with the server wallet)
- `portaldot_create_task` / `portaldot_complete_task` — write to the Agent Task Ledger ink! contract
- `portaldot_list_tasks` / `portaldot_get_task` — read the Task Ledger

## Usage

Just ask: "What's my POT balance?", "Send 5 POT to 5Grw…", "Create a task: ship the demo", "Show my tasks."
All results are real on-chain data — there are no mocked responses.
