# portaldot-mcp

**The first MCP server for [Portaldot](https://www.portaldot.io)** — a Substrate Layer-0 chain (token POT, ss58:42, 14 decimals). It lets any AI agent read and transact on Portaldot in natural language, and ships a generative-UI web app for people who don't run an MCP client.

> Portaldot Mini Hackathon Online S1 · Track 4 (AI-Powered Onchain Workflows)

## Two surfaces, one core

- **MCP server** (`packages/mcp`) — installs into any MCP client (Claude Code, Cursor, Claude Desktop, console). Headless signing via an auto-generated wallet. This is how an AI agent transacts on Portaldot.
- **Web app** (`packages/web`) — a chat UI with generative tool cards for people without an MCP client. Signing happens in the browser via an injected Polkadot wallet (SubWallet/Talisman); the server never holds keys.
- **Core** (`packages/core`) — the shared `@polkadot/api` brain: chain connection, wallet, contract, and all tool implementations (transport-agnostic).
- **ink! contract** (`contracts/task-ledger`) — an Agent Task Ledger deployed on Portaldot (POT gas), the on-chain primitive the agent manages.

## MCP tools

| Tool | What it does | Signs? |
|---|---|---|
| `portaldot_get_balance` | Free / reserved / total POT for an address | no |
| `portaldot_get_block_info` | Block number, hash, timestamp, extrinsic count | no |
| `portaldot_estimate_fee` | Real runtime fee for a transfer | no |
| `portaldot_transfer` | Send POT (transferKeepAlive), waits for inclusion | yes |
| `portaldot_create_task` | Create a task on the ink! Task Ledger | yes |
| `portaldot_complete_task` | Mark a task complete (owner only) | yes |
| `portaldot_list_tasks` | List an owner's tasks (read) | no |
| `portaldot_get_task` | Read a single task (read) | no |

All tools return **real chain data** — no mocks anywhere.

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

Then ask your agent: *"What's the latest Portaldot block?"*, *"Send 1 POT to 5Grw…"*, *"Create a task: ship the demo."*

## Install as an Agent Skill

A cross-client Agent Skill (`packages/skills/portaldot/SKILL.md`) teaches any agent *when* and *how* to use the tools — intent→tool table, parameter guide, and example workflows. Three ways to install:

```bash
# 1. Tell your agent (self-installs)
#    "Read https://<your-deployment>/skill.md and follow the instructions to install Portaldot MCP."

# 2. skills CLI
pnpm dlx skills add github:Blockchain-Oracle/portaldot-mcp --skill portaldot

# 3. Manual — copy SKILL.md into your client's skills dir (e.g. ~/.claude/skills/portaldot/)
```

Environment (`.env`):

```bash
PORTALDOT_RPC_URL=wss://mainnet.portaldot.io   # or ws://127.0.0.1:9944 for a local dev node
PORTALDOT_SEED_PHRASE=                          # auto-generated on first run if unset (~/.portaldot-mcp/config.json)
TASK_LEDGER_CONTRACT_ADDRESS=<deployed address>
TASK_LEDGER_METADATA_PATH=contracts/task-ledger/target/ink/task_ledger.json
# web chat — set ANY one: Anthropic, OpenAI, xAI, or Google (provider auto-detected).
# Override with AI_MODEL="provider:model" (e.g. openai:gpt-5, xai:grok-4, google:gemini-2.5-pro).
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
XAI_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
```

- **Deployed Task Ledger (devnet):** `5FrHbMS5qwYDhbRP8DopDbhH6Hosz4aX67D9Ga9g8fZGGqr1` — mainnet deploy pending POT for gas (one env-var flip).
- **Live demo:** _(filled after Vercel deploy)_

## Develop

```bash
pnpm dev:mcp     # MCP server (stdio)
pnpm dev:web     # web app
pnpm test        # real tests (mainnet reads + devnet writes/contract)
bash .claude/scripts/green-light.sh   # build + lint + typecheck + test
```

Stack: TypeScript · pnpm workspaces · `@polkadot/api` v16 · `@modelcontextprotocol/sdk` · Vercel AI SDK v6 (Anthropic/OpenAI/xAI/Google) · Next.js 16 · ink! v5. See `docs/architecture-decisions.md`.

## Note on ink! contract deployment

Portaldot's current node binary runs an **older Contracts API** whose metadata version modern `cargo-contract` / ink! 5 cannot target — instantiating against it fails with `unsupported metadata version` (a limitation shared by every ink! entry this season). The Task Ledger contract therefore deploys to **`substrate-contracts-node` v0.42 (pallet-contracts v9+)** per the core team's sanctioned PoC carve-out. It compiles cleanly and deploys **as-is to Portaldot once the node binary is updated**.

Crucially, **portaldot-mcp does not depend on the contract for eligibility** — its 28+ pallet tools (balances, assets, staking, identity, proxy, bounties, utility) run **natively on Portaldot with POT as gas**, verified against the real Portaldot runtime.

## License

MIT — see [LICENSE](./LICENSE). Contract source is open under the same.
