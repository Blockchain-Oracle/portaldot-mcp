# Story: ink! Task Ledger Contract

**ID:** story-ink-task-ledger  
**Epic:** Epic 5 — ink! Task Ledger  
**Estimated time:** 1.5h  
**Depends on:** story-mcp-write-tools  

---

## User story

As a Portaldot participant in the hackathon,  
I want to deploy an ink! smart contract that stores tasks onchain,  
So that the mandatory "Portaldot Native Deployment" judging requirement is satisfied with a real POT transaction.

---

## Acceptance criteria (BDD)

```
Given contracts/task-ledger/lib.rs contains a valid ink! v5 contract
When `cargo contract build` runs from the contracts/task-ledger directory
Then it exits 0 and produces:
  - target/ink/task_ledger.wasm (compiled WASM)
  - target/ink/metadata.json (contract ABI)

Given the WASM and metadata files exist
When the deployment script runs (contracts/task-ledger/deploy/deploy.py)
Then it:
  - Connects to Portaldot local dev node (ws://127.0.0.1:9944)
  - Deploys the contract using Alice's keypair
  - Prints the deployed contract address
  - Stores it in .env as TASK_LEDGER_CONTRACT_ADDRESS

Given the contract is deployed
When `cargo contract call ... --call create_task --args "Launch MVP"` is executed
Then the call succeeds and emits a TaskCreated event
And the task is stored in contract storage with a unique task_id

Given a task exists in the contract
When `cargo contract call ... --call get_tasks --args "5F3sA..."` is executed
Then it returns a Vec<Task> containing the task with its description and status

Given a task is created
When the task struct is verified in storage
Then it has fields: {id: u32, description: String, completed: bool, owner: AccountId, created_at: u64}

Given npm test runs on the contract deployment tests
Then at least 6 test cases pass (compile, build WASM, metadata validation, deploy simulation, event emission, storage retrieval)
```

---

## File modification map

- `contracts/task-ledger/Cargo.toml` — NEW — ink! v5 contract manifest
  - Dependencies: `ink` (v5), `scale`, `scale-info`
- `contracts/task-ledger/lib.rs` — NEW — complete ink! contract source
  - `#[ink::contract]` module
  - `TaskLedger` struct with task storage map
  - `create_task(description: String) -> u32` → creates and stores task, returns task_id
  - `complete_task(task_id: u32) -> Result<(), Error>` → marks task as complete
  - `get_tasks(owner: AccountId) -> Vec<Task>` → returns all tasks for an owner
  - `get_task(task_id: u32) -> Option<Task>` → returns single task
  - Events: `TaskCreated { task_id, owner, description }`, `TaskCompleted { task_id }`
- `contracts/task-ledger/deploy/deploy.py` — NEW — Python deployment script using `substrate-interface`
  - Reads `.env` for `PORTALDOT_SEED_PHRASE` or uses hardcoded Alice/Bob for local dev
  - Compiles contract if not already compiled
  - Deploys via `ContractCode.create_from_contract_files()`
  - Writes `TASK_LEDGER_CONTRACT_ADDRESS` to `.env`
  - Prints success message with contract address
- `contracts/task-ledger/deploy/README.md` — NEW — deployment instructions
- `contracts/task-ledger/__tests__/contract.test.ts` — NEW — vitest, ≥6 cases (compile, build, deploy sim, etc.)
- `packages/mcp-server/package.json` — UPDATE — add optional `pip` hook or note Python dependency

---

## Shell verification

```bash
cd contracts/task-ledger

# Build the contract
cargo contract build
echo "Build exit: $?"  # must be 0

# Verify WASM and metadata exist
ls -la target/ink/task_ledger.wasm
ls -la target/ink/metadata.json

# (Optional) deploy to local node if available
cd deploy
python3 deploy.py
# Check .env for TASK_LEDGER_CONTRACT_ADDRESS
grep TASK_LEDGER_CONTRACT_ADDRESS ../../.env
```

---

## Notes for coding agent

- ink! v5 syntax: use `#[ink::contract]`, `#[ink(storage)]`, `#[ink(message)]`, `#[ink(event)]`
- Storage: use `Mapping<AccountId, Vec<Task>>` for owner → tasks lookup
- Task struct: must be `#[derive(scale::Encode, scale::Decode)]` for serialization
- Event handling: define events with `#[ink(event)]` and emit via `Self::env().emit_event()`
- Constructor: `#[ink(constructor)]` method named `new()` — can be empty for this contract
- Error handling: define an `Error` enum and return `Result<T, Error>` from methods that can fail
- Deployment: the Python script uses the official `substrate-interface` library (already verified in research)
- Test contract logic: use ink!'s sandboxed environment. Tests should verify create/complete/get operations
- Contract address format: After deployment, it's a standard Substrate account address (SS58 format)
