![portaldot-mcp](https://github.com/Blockchain-Oracle/portaldot-mcp/raw/main/assets/wordmark.png)

The first MCP server for **Portaldot** — a Substrate Layer-0 chain (token POT, ss58:42, 14 decimals). Lets any AI agent read and transact on Portaldot in plain language: balances, transfers, tokens, staking, identity, governance, proxies, contracts — **34 typed tools** over stdio.

| | |
|---|---|
| GitHub      | <https://github.com/Blockchain-Oracle/portaldot-mcp> |
| Live web app | <https://portaldot-mcp.vercel.app> |
| Tool catalog | <https://portaldot-mcp.vercel.app/docs/tools> |
| Demo video  | <https://youtu.be/A7saL3LX4TE> |

## Install

### Claude Code

```bash
claude mcp add portaldot -- npx -y portaldot-mcp
```

### Cursor

Add to `~/.cursor/mcp.json` (or project `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "portaldot": { "command": "npx", "args": ["-y", "portaldot-mcp"] }
  }
}
```

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "portaldot": { "command": "npx", "args": ["-y", "portaldot-mcp"] }
  }
}
```

Restart your client and ask: *"What's the latest Portaldot block?"* — *"Send 1 POT to 5Grw…"* — *"Show me my account overview."*

## Environment

```bash
PORTALDOT_RPC_URL=wss://mainnet.portaldot.io   # or ws://127.0.0.1:9944 for a local dev node
PORTALDOT_SEED_PHRASE=                          # optional — auto-generated on first run, persisted to ~/.portaldot-mcp/config.json (0600)
```

Only `PORTALDOT_RPC_URL` matters in practice. On first run the server generates a fresh sr25519 wallet and writes the mnemonic to `~/.portaldot-mcp/config.json` with `0600` perms. Fund that address with POT to transact — the server never asks for keys interactively.

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

Full live catalog with schemas: <https://portaldot-mcp.vercel.app/docs/tools>.

## Signing model

Two surfaces share the same brain, with different signing:

- **This package (`portaldot-mcp`)** — headless. A sr25519 wallet is auto-generated on first run and lives at `~/.portaldot-mcp/config.json`. Suitable for an agent context where there is no browser to prompt for signatures.
- **Web app (`portaldot-mcp.vercel.app`)** — browser wallet (SubWallet, Talisman, Polkadot{.js}, Nova) via `@polkadot/extension-dapp`. The server never holds keys.

If you don't want the auto-wallet, set `PORTALDOT_SEED_PHRASE` and the server uses your seed instead.

## License

MIT — see [`LICENSE`](https://github.com/Blockchain-Oracle/portaldot-mcp/blob/main/LICENSE). Source: <https://github.com/Blockchain-Oracle/portaldot-mcp>.
