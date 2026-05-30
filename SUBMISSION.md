![youtube](https://youtu.be/A7saL3LX4TE)

![portaldot-mcp](https://github.com/Blockchain-Oracle/portaldot-mcp/raw/main/assets/wordmark.png)

The first MCP server for **Portaldot** — a Substrate Layer-0 chain (token POT, ss58:42, 14 decimals). Lets any AI agent read and transact on Portaldot in plain language, and ships a generative-UI web app for people who don't run an MCP client.

|   |   |
|---|---|
| Live app    | <https://portaldot-mcp.vercel.app> |
| Pitch deck  | <https://canva.link/ctm7rkges9jf2jd> |
| Demo video  | <https://youtu.be/A7saL3LX4TE> |
| GitHub      | <https://github.com/Blockchain-Oracle/portaldot-mcp> |
| npm         | [`portaldot-mcp`](https://www.npmjs.com/package/portaldot-mcp) |
| Track       | 4 — AI-Powered Onchain Workflows · Portaldot Mini Hackathon Online S1 |

![To do anything on Portaldot, you had to be a developer — pallets, JSON forms, forty events to read after every transaction, all locked behind Polkadot.js. portaldot-mcp removes that wall.](https://github.com/Blockchain-Oracle/portaldot-mcp/raw/main/assets/pitch-01-the-problem.png)

## What it does

To do anything on Portaldot, you had to be a developer — pallets, JSON forms, raw events. portaldot-mcp removes that wall. It exposes the entire Portaldot runtime as **34 typed AI tools** that any MCP client (Claude Code, Cursor, Claude Desktop, Console) can call from natural language. For everyone without an MCP client, the same brain powers a chat web app with generative tool cards and browser-injected wallet signing — the server never holds keys.

## Two surfaces, one core

- **`packages/mcp`** — the MCP server. `npx -y portaldot-mcp` installs into any MCP client. Headless signing via an auto-generated wallet.
- **`packages/web`** — Next.js 16 + Vercel AI SDK v6 generative-UI chat. Browser wallet signing (SubWallet, Talisman, Polkadot{.js}, Nova).
- **`packages/core`** — the shared `@polkadot/api` brain: chain, wallet, contract, all tool implementations. Transport-agnostic.
- **`packages/skills/portaldot`** — cross-client Agent Skill: teaches any agent *when* and *how* to use the tools (intent → tool table, parameter guide, example workflows).
- **`contracts/task-ledger`** — Agent Task Ledger ink! v5 contract (POT gas), the on-chain primitive the agent manages.

## What the 34 tools cover

| Surface | Examples |
|---|---|
| Balances & transfers | `get_balance`, `transfer`, `estimate_fee` |
| Assets pallet        | `create_token`, `mint_token`, `transfer_token`, `my_tokens`, `token_info` |
| Staking              | `staking_info`, `validators`, `stake` |
| Governance           | `propose_bounty`, `list_bounties` |
| Identity & accounts  | `set_identity`, `account_overview`, `generate_account` |
| Proxy & multisig     | `add_proxy`, `list_proxies`, `multisig_address` |
| Chain & addresses    | `chain_info`, `get_block_info`, `convert_address`, `resolve_address`, `validate_address` |
| Contracts (generic)  | `call_contract`, `read_contract`, `dry_run_contract`, `decode_contract_metadata` |
| Task Ledger (ink!)   | `create_task`, `complete_task`, `get_task`, `list_tasks` |

Full 34-tool catalog: <https://portaldot-mcp.vercel.app/docs/tools>.

## Install (one command)

```bash
# Claude Code (Cursor and Claude Desktop work the same way)
claude mcp add portaldot -- npx -y portaldot-mcp
```

Then ask: *"What's the latest Portaldot block?"* — *"Send 1 POT to 5Grw…"* — *"Create a task: ship the demo."*

## Stack

TypeScript · pnpm workspaces (strict, ESM) · **`@polkadot/api` v16** + `api-contract` (zero custom types, works against served metadata) · **`@modelcontextprotocol/sdk`** (stdio + Streamable HTTP) · **Vercel AI SDK v6** generative UI · **Next.js 16** · React 19 · **ink! v5** · `@polkadot/extension-dapp` for browser wallets.

Architecture rationale: [`docs/architecture-decisions.md`](https://github.com/Blockchain-Oracle/portaldot-mcp/blob/main/docs/architecture-decisions.md).

## Note on ink! contract deployment

Portaldot's current node binary runs an older Contracts API whose metadata version modern `cargo-contract` / ink! 5 cannot target — instantiating against it fails with `unsupported metadata version`. The Task Ledger contract therefore deploys to `substrate-contracts-node` v0.42 (pallet-contracts v9+) for now. It compiles cleanly and deploys as-is to Portaldot the moment the node binary is updated. The 28+ pallet tools run natively on Portaldot today, with POT as gas, verified against the real runtime.

## License

MIT — see [`LICENSE`](https://github.com/Blockchain-Oracle/portaldot-mcp/blob/main/LICENSE). Contract source open under the same.
