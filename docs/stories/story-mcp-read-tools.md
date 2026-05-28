# Story: MCP Read Tools

**ID:** story-mcp-read-tools  
**Epic:** Epic 2 — MCP Read Tools  
**Estimated time:** 1.5h  
**Depends on:** story-chain-connection  

---

## User story

As an AI agent using portaldot-mcp,  
I want to query Portaldot chain state (balance, block info, fee estimates) via MCP tools,  
So that I can gather information for natural language responses without knowing the Substrate API.

---

## Acceptance criteria (BDD)

```
Given portaldot_get_balance tool is registered
When the MCP server receives a call with address='5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
Then it returns {free: <number>, reserved: <number>, total: <number>, formatted: <string>}
And formatted field shows balance in POT (dividing by 10^14)

Given portaldot_get_block_info tool is registered
When called with blockNumber=0
Then it returns {number: 0, hash: <64-char hex>, timestamp: <unix ms>, extrinsics: []}

Given portaldot_estimate_fee tool is registered
When called with to='5GrwvaEF...', amount='1000000000000' (0.001 POT), from='5F3sA...'
Then it returns {fee: <number>, feePOT: <string>}
And feePOT is human-readable (divided by 10^14)

Given all three tools are implemented
When `pnpm test -- src/tools/__tests__/read-tools.test.ts` runs
Then at least 12 test cases pass (4 per tool: happy path, invalid input, chain error, formatting)

Given the MCP server is running with all three tools registered
When a Claude instance calls each tool via the MCP client
Then all three return real data from wss://mainnet.portaldot.io
```

---

## File modification map

- `packages/mcp-server/src/tools/balance.ts` — NEW — `portaldot_get_balance` tool implementation
- `packages/mcp-server/src/tools/block.ts` — NEW — `portaldot_get_block_info` tool implementation
- `packages/mcp-server/src/tools/fee.ts` — NEW — `portaldot_estimate_fee` tool implementation
- `packages/mcp-server/src/tools/__tests__/read-tools.test.ts` — NEW — vitest suite, ≥12 cases
- `packages/mcp-server/src/server.ts` — UPDATE — register all three tools via `server.setRequestHandler()`
- `packages/mcp-server/package.json` — UPDATE — add test script if not present

---

## Shell verification

```bash
cd packages/mcp-server
npm run test -- src/tools/__tests__/read-tools.test.ts
# Output: "12 passed" or more

npm run build
# Verify no TypeScript errors
```

---

## Notes for coding agent

- `portaldot_get_balance`: Call `api.query.system.account(address)` → extract `data.free` and `data.reserved` → divide both by 10^14 for POT display
- `portaldot_get_block_info`: Use `api.rpc.chain.getBlockHash(blockNumber)` and `api.query.system.blockNumber()` for current block
- `portaldot_estimate_fee`: Use `api.tx.balances.transferKeepAlive(to, amount).paymentInfo(from)` to get fee estimate
- All tool parameters must validate address format (SS58) before calling the API
- Tests should mock the `@polkadot/api` responses for chain errors and invalid inputs
- Each tool must include proper error handling and return meaningful error messages
