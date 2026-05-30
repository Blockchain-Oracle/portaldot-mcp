# portaldot-mcp

The first MCP server for [Portaldot](https://www.portaldot.io) — a Substrate Layer-0 chain (token POT, ss58:42, 14 decimals). Lets any AI agent read and transact on Portaldot in plain language, and ships a generative-UI web app for people who don't run an MCP client.

- Live app: <https://portaldot-mcp.vercel.app>
- npm: [`portaldot-mcp`](https://www.npmjs.com/package/portaldot-mcp)
- Repo: [Blockchain-Oracle/portaldot-mcp](https://github.com/Blockchain-Oracle/portaldot-mcp)
- Demo & screenshots: [demo.md](./demo.md)

> Portaldot Mini Hackathon Online S1 · Track 4 (AI-Powered Onchain Workflows)

## Two surfaces, one core

- `packages/mcp` — the MCP server. Installs into any MCP client (Claude Code, Cursor, Claude Desktop, console). Headless signing via an auto-generated wallet. How an AI agent transacts on Portaldot.
- `packages/web` — the chat UI with generative tool cards, for people without an MCP client. Signing happens in the browser via an injected Polkadot wallet (SubWallet, Talisman, Polkadot{.js}, Nova); the server never holds keys.
- `packages/core` — the shared `@polkadot/api` brain: chain connection, wallet, contract, and all tool implementations (transport-agnostic).
- `contracts/task-ledger` — an Agent Task Ledger ink! v5 contract deployed on Portaldot (POT gas), the on-chain primitive the agent manages.

## What the MCP server can do

The 34 tools cover the live Portaldot pallets — balances, blocks, fees, assets, staking, identity, proxy, bounties, batches — plus the Task Ledger contract. A few highlights:

| Tool | What it does | Signs? |
|---|---|---|
| `portaldot_get_balance` | Free / reserved / total POT for an address | no |
| `portaldot_get_block_info` | Block number, hash, timestamp, extrinsic count | no |
| `portaldot_estimate_fee` | Real runtime fee for a transfer | no |
| `portaldot_transfer` | Send POT (`transferKeepAlive`), waits for inclusion | yes |
| `portaldot_create_task` | Create a task on the ink! Task Ledger | yes |
| `portaldot_complete_task` | Mark a task complete (owner only) | yes |
| `portaldot_list_tasks` | List an owner's tasks | no |
| `portaldot_get_task` | Read a single task | no |

The full 34-tool catalog is at <https://portaldot-mcp.vercel.app/docs/tools>.

## Quickstart (MCP)

```bash
# add to Claude Code — published to npm, no clone or build needed
claude mcp add portaldot -- npx -y portaldot-mcp
```

Or build from source:

```bash
pnpm install && pnpm build
claude mcp add portaldot -- node /absolute/path/to/packages/mcp/dist/index.js
```

Then ask: *"What's the latest Portaldot block?"*, *"Send 1 POT to 5Grw…"*, *"Create a task: ship the demo."*

## Install as an Agent Skill

A cross-client Agent Skill (`packages/skills/portaldot/SKILL.md`) teaches any agent *when* and *how* to use the tools — intent→tool table, parameter guide, example workflows. Three ways to install:

```bash
# 1. Tell your agent (self-installs)
#    "Read https://<your-deployment>/skill.md and follow the instructions to install Portaldot MCP."

# 2. skills CLI
pnpm dlx skills add github:Blockchain-Oracle/portaldot-mcp --skill portaldot

# 3. Manual — copy SKILL.md into your client's skills dir (e.g. ~/.claude/skills/portaldot/)
```

## Environment

```bash
PORTALDOT_RPC_URL=wss://mainnet.portaldot.io   # or ws://127.0.0.1:9944 for a local dev node
PORTALDOT_SEED_PHRASE=                          # auto-generated on first run if unset (~/.portaldot-mcp/config.json)
TASK_LEDGER_CONTRACT_ADDRESS=<deployed address>
TASK_LEDGER_METADATA_PATH=contracts/task-ledger/target/ink/task_ledger.json

# Web chat — set any one provider. Auto-detected.
# Override with AI_MODEL="provider:model" (e.g. openai:gpt-5, xai:grok-4, google:gemini-2.5-pro).
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
XAI_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
```

Deployed Task Ledger (devnet): `5FrHbMS5qwYDhbRP8DopDbhH6Hosz4aX67D9Ga9g8fZGGqr1`. Mainnet deploy is a single env-var flip away (see note below).

## Develop

```bash
pnpm dev:mcp     # MCP server (stdio)
pnpm dev:web     # web app
pnpm test        # real tests (mainnet reads + devnet writes/contract)
bash .claude/scripts/green-light.sh   # build + lint + typecheck + test
```

Stack: TypeScript · pnpm workspaces · `@polkadot/api` v16 · `@modelcontextprotocol/sdk` · Vercel AI SDK v6 (Anthropic / OpenAI / xAI / Google) · Next.js 16 · ink! v5. Architecture rationale: [`docs/architecture-decisions.md`](./docs/architecture-decisions.md).

## Note on ink! contract deployment

Portaldot's current node binary runs an older Contracts API whose metadata version modern `cargo-contract` / ink! 5 cannot target — instantiating against it fails with `unsupported metadata version`. The Task Ledger contract therefore deploys to `substrate-contracts-node` v0.42 (pallet-contracts v9+) for now. It compiles cleanly and deploys as-is to Portaldot the moment the node binary is updated.

The MCP server itself does not depend on the contract — the 28+ pallet tools (balances, assets, staking, identity, proxy, bounties, utility) run natively on Portaldot with POT as gas, verified against the real runtime.

## License

MIT — see [LICENSE](./LICENSE). Contract source is open under the same.
