---
name: portaldot
description: Read and transact on the Portaldot blockchain (Substrate L0; token POT, 14 decimals, ss58 prefix 42) in plain language via 34 MCP tools — balances, blocks, fees, transfers, tokens, staking, identity, proxies, bounties, ink! contracts, and the Agent Task Ledger. Trigger whenever the user mentions Portaldot, POT, a 5… ss58 address, sending/checking funds on Portaldot, minting a token, staking, or on-chain tasks — even if they don't name a tool. Skip for general blockchain knowledge, price questions about unrelated chains, or anything answerable from training data.
version: 1.0.0
---

# Portaldot MCP Skill

Portaldot is a Substrate Layer-0 chain. Native token **POT** has **14 decimals** and addresses use **ss58 prefix 42** (the `5…` form). This skill teaches you when and how to drive the 34 Portaldot MCP tools so you read real chain state and propose transactions the user signs — never guessing values.

## When to Use

Trigger when the user:
- Asks to check a balance, account, block, fee, validators, or staking on Portaldot
- Wants to send POT, batch-send, or move/mint/create a token
- Mentions a `5…` ss58 address, "my account", POT, or "the chain"
- Wants to set an identity, add a proxy, propose a bounty, or stake
- Wants to read/call an ink! contract, or manage the on-chain Task Ledger
- Needs address tooling (validate, convert ss58, generate an account, multisig)

## When NOT to Use

- General knowledge ("what is a Substrate parachain?")
- Prices/markets for other chains (this is not a trading or price API)
- Pure math, or anything answerable without touching the chain

## Tool Selection

Pick the tool from intent; pass only the params shown. Most reads default the address to the configured wallet when one isn't given.

| User intent | Tool | Key params |
|---|---|---|
| Balance of an account | `portaldot_get_balance` | address |
| Everything about an account (balance+identity+staking) | `portaldot_account_overview` | address |
| Latest / a specific block | `portaldot_get_block_info` | blockNumber? |
| Network status (token, issuance, era, best block) | `portaldot_chain_info` | — |
| Fee for a transfer before sending | `portaldot_estimate_fee` | to, amount |
| Active validators | `portaldot_validators` | — |
| Staking position for an account | `portaldot_staking_info` | address |
| On-chain identity for an account | `portaldot_resolve_address` | address |
| Watch a balance change live (bounded) | `portaldot_watch_balance` | address, seconds (≤60) |
| **Send POT** | `portaldot_transfer` | to, amount |
| **Send POT to many at once** | `portaldot_batch_transfer` | transfers: [{to, amount}] |
| Token (asset) info | `portaldot_token_info` | assetId |
| Tokens an account owns | `portaldot_my_tokens` | address? |
| **Create a token** | `portaldot_create_token` | name, symbol, decimals, supply |
| **Mint more of a token** | `portaldot_mint_token` | assetId, to, amount |
| **Send a token** | `portaldot_transfer_token` | assetId, to, amount |
| **Stake POT** | `portaldot_stake` | amount |
| **Set my identity** | `portaldot_set_identity` | display, … |
| Proxies for an account | `portaldot_list_proxies` | address |
| **Add a proxy** | `portaldot_add_proxy` | delegate, proxyType |
| Open treasury bounties | `portaldot_list_bounties` | — |
| **Propose a bounty** | `portaldot_propose_bounty` | value, description |
| My on-chain tasks | `portaldot_list_tasks` | owner? |
| A single task | `portaldot_get_task` | id |
| **Create a task** | `portaldot_create_task` | description |
| **Complete a task** | `portaldot_complete_task` | id |
| Read an ink! contract (no signing) | `portaldot_read_contract` | address, message, args? |
| Simulate a contract call (gas+result) | `portaldot_dry_run_contract` | address, message, args? |
| **Call an ink! contract** | `portaldot_call_contract` | address, message, args?, value? |
| Inspect a contract's messages | `portaldot_decode_contract_metadata` | metadata |
| Is this address valid? | `portaldot_validate_address` | address |
| Re-encode an address to another ss58 | `portaldot_convert_address` | address, prefix |
| Make a fresh keypair | `portaldot_generate_account` | — |
| Compute a multisig address | `portaldot_multisig_address` | signatories, threshold |

**Bold tools sign a transaction** — they need a funded signer (see below). Everything else is a free read.

## Parameter Guide

- **address**: an ss58 string for prefix 42 (`5…`). When the user says "my", "me", or omits an address on a read, use the connected/configured wallet address.
- **amount**: a human POT string — `"1"`, `"0.5"`, `"100"`. The tools convert to 14-decimal base units for you; do **not** pre-multiply by 10^14.
- **assetId**: an integer id of a pallet-assets token (from `portaldot_token_info` / `portaldot_my_tokens`).
- **seconds** (`watch_balance`): bounded to ≤ 60. Chain finality is ~6s; don't expect sub-second updates.
- **proxyType**: e.g. `Any`, `NonTransfer`, `Governance`, `Staking`.
- **message/args** (contracts): the ink! message name and its ordered arguments.

## Free vs Wallet-Required

**Free reads (no signer):** get_balance, account_overview, get_block_info, chain_info, estimate_fee, validators, staking_info, resolve_address, watch_balance, token_info, my_tokens, list_proxies, list_bounties, list_tasks, get_task, read_contract, dry_run_contract, decode_contract_metadata, validate_address, convert_address, generate_account, multisig_address.

**Signed writes (need a funded signer):** transfer, batch_transfer, create_token, mint_token, transfer_token, stake, set_identity, add_proxy, propose_bounty, create_task, complete_task, call_contract.

In the **web app** the user signs each write in their browser wallet (SubWallet/Talisman) — the server holds no keys. On the **MCP server** writes are signed by `PORTALDOT_SEED_PHRASE` (auto-generated on first run at `~/.portaldot-mcp/config.json`); that address must hold POT for gas.

## Critical Behaviors

- **Never invent addresses, balances, or hashes.** Every read hits the real chain — if a tool errors, report the error, don't fabricate a result.
- **Confirm before signing.** For interactive use, restate the recipient + amount and let the user approve before calling a write tool. For autonomous use, proceed.
- **Default to the user's own account** for "my balance / my tokens / my identity" — pass their connected address.
- **Estimate before large transfers** with `portaldot_estimate_fee` when the user cares about cost.
- **Reads are free and safe to call liberally**; writes cost POT gas and change state — treat them as deliberate.
- **Task Ledger tools require the ink! contract.** `list_tasks` / `get_task` / `create_task` / `complete_task` only work when `TASK_LEDGER_CONTRACT_ADDRESS` (+ `TASK_LEDGER_METADATA_PATH`) are set. The contract currently deploys to `substrate-contracts-node`, not mainnet (an ink!5 metadata limitation of the current node) — on mainnet these tools return a clear "not set" error; surface it, don't retry blindly.

## Error Handling

| Error | Cause | Fix |
|---|---|---|
| `failed to connect to <url>` | RPC unreachable | Check `PORTALDOT_RPC_URL`; mainnet is `wss://mainnet.portaldot.io` |
| `TASK_LEDGER_CONTRACT_ADDRESS is not set` | Task tools without a deployed contract | Deploy the ink! contract + set the env vars, or skip task tools |
| insufficient balance / fees | Signer has no POT | Fund the signer address (write tools only) |
| invalid address | Not ss58 prefix 42 | Verify with `portaldot_validate_address` / `portaldot_convert_address` |

## Example Workflows

### Check, then send
```
1. portaldot_get_balance (address: <recipient>)      → sanity-check the target
2. portaldot_estimate_fee (to: <recipient>, amount: "5")
3. portaldot_transfer (to: <recipient>, amount: "5")  → user signs
```

### Launch a token
```
1. portaldot_create_token (name: "Demo", symbol: "DEMO", decimals: 12, supply: "1000000")
2. portaldot_mint_token (assetId: <new id>, to: <me>, amount: "500")
3. portaldot_my_tokens                                → confirm it appears
```

### Manage on-chain tasks
```
1. portaldot_create_task (description: "ship the demo")
2. portaldot_list_tasks                               → see it pending
3. portaldot_complete_task (id: <id>)                 → mark done
```

## Install

```bash
# Claude Code (published to npm — no clone, no build)
claude mcp add portaldot -- npx -y portaldot-mcp

# Gemini CLI
gemini mcp add portaldot npx -y portaldot-mcp

# Cursor / Claude Desktop / Windsurf — add to the client's MCP config:
#   { "mcpServers": { "portaldot": { "command": "npx", "args": ["-y", "portaldot-mcp"] } } }
```

Environment:
- `PORTALDOT_RPC_URL` — `wss://mainnet.portaldot.io` (default) or `ws://127.0.0.1:9944` for a local dev node.
- `PORTALDOT_SEED_PHRASE` — optional; auto-generated on first run. Fund this address with POT to send transactions.
- `TASK_LEDGER_CONTRACT_ADDRESS` + `TASK_LEDGER_METADATA_PATH` — required only for the Task Ledger tools.
