# Story: Chain Connection

**ID:** story-chain-connection  
**Epic:** Epic 1 — Foundation  
**Estimated time:** 0.75h  
**Depends on:** story-monorepo-setup  

---

## User story

As a coding agent building the MCP server,  
I want `@polkadot/api` initialized and verified against Portaldot mainnet,  
So that subsequent tool stories can assume a stable chain connection without worrying about setup.

---

## Acceptance criteria (BDD)

```
Given packages/mcp-server/src/chain/connection.ts is implemented
When the MCP server starts
Then it initializes an ApiPromise to wss://mainnet.portaldot.io

Given the API is initialized
When a chain.getBlockHash(0) query runs
Then it returns a valid block hash (64-char hex string starting with 0x)

Given the API is initialized
When system.account storage is queried with a test address
Then it returns a data structure with 'data.free' and 'data.reserved' fields

Given the module-level connection singleton is created
When two separate tool handlers call getConnection()
Then they receive the same ApiPromise instance (no duplicate connections)

Given the API is connected
When `pnpm test -- chain.test.ts` runs
Then at least 5 chain connection test cases pass (connection, query, storage, types, disconnect)
```

---

## File modification map

- `packages/mcp-server/src/chain/connection.ts` — NEW — `SubstrateConnection` singleton class
  - Constructor accepts optional `rpcUrl` (defaults to `wss://mainnet.portaldot.io`)
  - Public method `async connect()` — initializes ApiPromise, waits for ready
  - Public method `async getApi()` — returns initialized ApiPromise
  - Public method `async disconnect()` — closes connection
  - Static method `getInstance()` — singleton access
- `packages/mcp-server/src/chain/__tests__/connection.test.ts` — NEW — vitest suite with ≥5 test cases
- `packages/mcp-server/src/index.ts` — UPDATE — import and call `getConnection().connect()` on startup
- `packages/mcp-server/package.json` — UPDATE — add `@polkadot/api` (v12), `@polkadot/types`, `vitest`

---

## Shell verification

```bash
cd packages/mcp-server
npm run test -- src/chain/__tests__/connection.test.ts
# Output: "5 passed" or more

# Quick manual test
npm run build
node dist/index.js &
PID=$!
sleep 2
# Server should be running; kill it
kill $PID
```

---

## Notes for coding agent

- Use `ApiPromise.create({ provider: new WsProvider(rpcUrl) })` + `await api.isReady`
- No custom types needed for basic queries — Substrate defaults are sufficient
- Error handling: if connection fails, log the error and retry with exponential backoff (max 3 retries)
- The test suite must cover: successful connection, failed connection (mocked rejection), query execution, storage access, connection singleton behavior
- Types from `@polkadot/types` should be used for the storage query result
