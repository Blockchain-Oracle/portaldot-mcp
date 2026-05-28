# Task Ledger — build & deploy

ink! v5 contract. The Portaldot MCP server's contract tools (`portaldot_create_task`,
`portaldot_complete_task`, `portaldot_list_tasks`, `portaldot_get_task`) call it.

## Build

```bash
cd contracts/task-ledger
cargo contract build --release
# → target/ink/task_ledger.wasm  (code)
#   target/ink/task_ledger.json  (metadata/ABI)
#   target/ink/task_ledger.contract (bundle)
```

## Deploy

Devnet (substrate-contracts-node `--dev`, Alice prefunded):

```bash
bash deploy/deploy.sh        # prints the deployed SS58 contract address
```

Mainnet (needs a POT-funded account):

```bash
PORTALDOT_RPC_URL=wss://mainnet.portaldot.io DEPLOY_SURI="<your seed phrase>" bash deploy/deploy.sh
```

## Wire it to the MCP server

```bash
# in the repo root .env (or the MCP client's env)
TASK_LEDGER_CONTRACT_ADDRESS=<address printed above>
TASK_LEDGER_METADATA_PATH=contracts/task-ledger/target/ink/task_ledger.json
```
