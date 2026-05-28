# Story: MCP Write Tools

**ID:** story-mcp-write-tools  
**Epic:** Epic 3 — Wallet + Transfer  
**Estimated time:** 1.5h  
**Depends on:** story-wallet-integration  

---

## User story

As an AI agent using portaldot-mcp,  
I want to execute a POT transfer via the `portaldot_transfer` MCP tool,  
So that I can send value on behalf of a user (browser-signed) or the agent itself (auto-keypair-signed).

---

## Acceptance criteria (BDD)

```
Given portaldot_transfer tool is implemented
When called with {to: '5Grwva...', amount: '1000000000000', from: '5F3sA...'}
Then it composes a Balances.transferKeepAlive extrinsic

Given a valid transfer extrinsic is ready
When signAndSend() is called with the auto-keypair (CLI mode)
Then the extrinsic is signed with the keypair and broadcast to the chain
And returns {txHash: <64-char hex>, blockHash: <hex>, fee: <number>}

Given a valid transfer extrinsic is ready
When signAndSend() is called via browser wallet (web mode)
Then the wallet extension shows an approval popup
And user clicking "Approve" signs and broadcasts the tx
And returns {txHash, blockHash, fee}

Given the extrinsic is broadcast
When the node confirms inclusion
Then blockHash field is populated and is a valid block hash

Given invalid inputs are passed (bad address, negative amount, from != signer)
When portaldot_transfer is called
Then it rejects with a descriptive error message

Given pnpm test runs on the write-tools test suite
Then at least 10 test cases pass (compose, sign cli, sign browser fallback, fee calc, error handling, broadcast, block confirmation)
```

---

## File modification map

- `packages/mcp-server/src/tools/transfer.ts` — NEW — `portaldot_transfer` tool implementation
  - Validates `to` address (SS58 format)
  - Validates `amount` (positive, fits in BigInt)
  - Composes extrinsic via `api.tx.balances.transferKeepAlive(to, amount)`
  - Signs via auto-keypair if `from` is provided; expects browser wallet signature if not (web context)
  - Broadcasts via `submitExtrinsic()` with `wait_for_inclusion: true`
  - Returns `{txHash, blockHash, fee, feePOT}`
- `packages/mcp-server/src/tools/__tests__/write-tools.test.ts` — NEW — vitest, ≥10 cases
- `packages/mcp-server/src/server.ts` — UPDATE — register `portaldot_transfer` tool
- `apps/web/lib/mcp-client.ts` — NEW — client-side MCP tool dispatcher
  - `callMcpTool(toolName, params)` — returns Promise<result>
  - Handles browser wallet signing context automatically

---

## Shell verification

```bash
cd packages/mcp-server
npm run test -- src/tools/__tests__/write-tools.test.ts
# Output: "10 passed"

npm run build
# Verify no errors

# Manual test on local dev node (if available)
# Run server, call portaldot_transfer with local dev node Alice/Bob accounts
```

---

## Notes for coding agent

- Use `api.tx.balances.transferKeepAlive()` not `transfer()` — keep-alive prevents account destruction
- Amount must be passed as raw units (multiply by 10^14 if user provides POT decimals)
- Fee calculation: `paymentInfo = await extrinsic.paymentInfo(signerAddress)` before broadcasting
- For CLI mode, sign with auto-keypair directly: `extrinsic.sign(keypair)` then `api.tx.submit(extrinsic)`
- For web mode, this story prepares the extrinsic; actual signing happens in the Next.js component (story-generative-ui-components)
- Error handling: validate address format, amount bounds, chain connection before composing
- Test mocking: use vitest mocks for the API responses, mock keypair signing
