# Story: Task Ledger MCP Tools

**ID:** story-task-ledger-mcp-tools  
**Epic:** Epic 5 — ink! Task Ledger  
**Estimated time:** 1h  
**Depends on:** story-ink-task-ledger  

---

## User story

As an AI agent using portaldot-mcp,  
I want to create and read tasks from the deployed ink! Task Ledger contract,  
So that users can ask "create a task: Deploy to mainnet" and see it stored onchain.

---

## Acceptance criteria (BDD)

```
Given the Task Ledger contract is deployed and TASK_LEDGER_CONTRACT_ADDRESS is set
When portaldot_call_contract tool is invoked with:
  contractAddress=TASK_LEDGER_CONTRACT_ADDRESS,
  method='create_task',
  args={description: 'Deploy to mainnet'}
Then it:
  - Reads the contract metadata JSON
  - Composes a call to the create_task method
  - Signs and broadcasts the tx (using auto-keypair or wallet)
  - Returns {txHash, events: [{name: 'TaskCreated', data: {task_id, description}}]}

Given a task has been created
When portaldot_read_contract tool is invoked with:
  contractAddress=TASK_LEDGER_CONTRACT_ADDRESS,
  method='get_tasks',
  args={owner: userAddress}
Then it:
  - Reads contract state (no tx signing needed)
  - Returns {result: [{id: 1, description: 'Deploy to mainnet', completed: false, owner: '...', created_at: 1234567}]}

Given portaldot_read_contract is called with a non-existent owner address
When the contract's get_tasks is invoked
Then it returns {result: []} (empty task list)

Given the portaldot_call_contract and portaldot_read_contract tools are registered
When npm test runs
Then at least 8 test cases pass (create task, read tasks, invalid address, event parsing, error handling, metadata loading, signing, state query)
```

---

## File modification map

- `packages/mcp-server/src/tools/contract-call.ts` — NEW — `portaldot_call_contract` tool
  - Loads contract metadata from `TASK_LEDGER_METADATA_PATH` (env var, defaults to hardcoded path)
  - Composes call via `contract.tx[methodName](...args)`
  - Signs and broadcasts with auto-keypair (CLI) or expects signed extrinsic (web)
  - Extracts and returns events from tx receipt
  - Includes proper error handling (contract not found, method not found, encoding errors)
- `packages/mcp-server/src/tools/contract-read.ts` — NEW — `portaldot_read_contract` tool
  - Reads contract state via RPC call (no signing)
  - Composes and decodes result via contract ABI
  - Returns decoded result as JSON
- `packages/mcp-server/src/tools/__tests__/contract-tools.test.ts` — NEW — vitest, ≥8 cases
- `packages/mcp-server/src/server.ts` — UPDATE — register both contract tools
- `.env.example` — UPDATE or CREATE — add `TASK_LEDGER_CONTRACT_ADDRESS` and `TASK_LEDGER_METADATA_PATH` examples
- `apps/web/components/tools/TaskCreatedCard.tsx` — UPDATE — add "View on Explorer" link that uses block explorer
- `apps/web/components/tools/TaskListCard.tsx` — UPDATE — renders task list from contract read

---

## Shell verification

```bash
cd packages/mcp-server
npm run test -- src/tools/__tests__/contract-tools.test.ts
# Output: "8 passed"

# Verify contract metadata file path
echo $TASK_LEDGER_METADATA_PATH
# or check .env for it

npm run build
# Verify no TypeScript errors
```

---

## Notes for coding agent

- Contract ABI: Load metadata JSON (from `contracts/task-ledger/target/ink/metadata.json` post-build)
- Use `@polkadot/api` contract module: `new ContractPromise(api, metadata, contractAddress)`
- For calling (write): `contract.tx.create_task({args}).signAndSend(signer)`
- For reading (read): `contract.query.get_tasks({args}).then(({ result }) => result)`
- Event decoding: ink! events are emitted by the contract and available in the tx receipt
- Error cases: contract address format validation, metadata not found, method not in ABI, encoding/decoding failures
- Tests: mock contract metadata, mock API responses, test event extraction
- The TaskListCard should format the returned tasks nicely with status indicators (✅ for completed, ⏳ for pending)
