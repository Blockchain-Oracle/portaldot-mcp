# Story: Wallet Integration

**ID:** story-wallet-integration  
**Epic:** Epic 3 — Wallet + Transfer  
**Depends on:** story-mcp-read-tools  

> ⚠️ **Reconciled 2026-05-28 (canonical: `architecture-decisions.md`).** Two signing contexts, NOT a wallet toggle:
> - **MCP-client context (`packages/core`/`packages/mcp`, headless):** auto-generate a keypair on first run via `mnemonicGenerate()` + `@polkadot/keyring`, persist to `~/.portaldot-mcp/config.json` (key never leaves the machine). The server signs.
> - **Web context (`packages/web`, browser):** signing is done by the user's injected extension via **`@polkadot/extension-dapp`** (`web3Enable`/`web3Accounts`/`web3FromSource`) — the server NEVER signs. **No `use-inkathon`.** Multi-wallet connect (Talisman/SubWallet/Polkadot.js) through a designed modal.
> Where this older body says `use-inkathon` / `InkathonProvider`, ignore it — use `@polkadot/extension-dapp` + a custom React context.

---

## User story

As the portaldot-mcp system,  
I want to support both browser wallet mode (Talisman/SubWallet via injectedWeb3) and headless CLI mode (auto-generated keypair),  
So that the same MCP server can be used by web users signing with their extension and AI agents signing with an env-var seed phrase.

---

## Acceptance criteria (BDD)

```
Given the MCP server runs with PORTALDOT_SEED_PHRASE not set
When the server starts
Then it generates a new keypair via mnemonicGenerate()
And writes PORTALDOT_SEED_PHRASE to .env (or prints it to stdout)
And logs the generated address

Given PORTALDOT_SEED_PHRASE is set in .env
When getKeyPair() is called
Then it returns a valid Keypair derived from the mnemonic

Given a browser context with Talisman extension installed
When window.injectedWeb3 is accessed
Then it returns the Talisman provider object

Given Next.js app mounts on localhost:3000
When useInkathon hook initializes
Then it connects to the browser wallet (if extension is available)
And returns useWallet() hook with currentAccount, isConnecting, connect, disconnect methods

Given the web app has wallet connected
When a transaction needs signing
Then signAndSend() is called via the wallet extension (not via auto-keypair)

Given the web app is in development with no extension
When a transaction is initiated
Then it shows a fallback UI: "Please install Talisman wallet to sign transactions"

Given packages/mcp-server/src/chain/keypair.ts is implemented
When npm test runs
Then at least 8 test cases pass (keygen, mnemonic load, SS58 validation, fallback detection, env var handling, error cases)
```

---

## File modification map

- `packages/mcp-server/src/chain/keypair.ts` — NEW — auto-keypair management
  - `generateAutoKeypair()` — uses `mnemonicGenerate()` + `Keypair.createFromUri()`
  - `getAutoKeypair()` — reads from env, falls back to generate + write .env
  - Exports `PORTALDOT_SEED_PHRASE` to .env on first run
  - Validates and handles errors gracefully
- `packages/mcp-server/src/chain/__tests__/keypair.test.ts` — NEW — vitest, ≥8 cases
- `apps/web/lib/wallet.ts` — NEW — React context for wallet management
  - `useWallet()` hook wrapper around `useInkathon`
  - `isExtensionAvailable()` check for `window.injectedWeb3`
  - `connectWallet()` / `disconnectWallet()` helpers
- `apps/web/app/providers.tsx` — NEW or UPDATE — wraps app with InkathonProvider + WalletProvider
- `apps/web/components/wallet/WalletConnect.tsx` — NEW — connect/disconnect button component
- `apps/web/components/wallet/WalletStatus.tsx` — UPDATE or NEW — displays connected account + balance

---

## Shell verification

```bash
# MCP server tests
cd packages/mcp-server
npm run test -- src/chain/__tests__/keypair.test.ts
# Output: "8 passed"

# Verify .env was written (or keypair was generated)
cat .env | grep PORTALDOT_SEED_PHRASE | wc -l  # should be 1

# Web app build
cd apps/web
npm run build
echo "Web build exit: $?"  # should be 0
```

---

## Notes for coding agent

- Auto-keypair on CLI: use `@polkadot/util-crypto` functions — `mnemonicGenerate()` then `Keypair.createFromUri(mnemonic)`
- Write to `.env` with `fs.appendFileSync()` only on first run (check if `PORTALDOT_SEED_PHRASE` exists first)
- For the React side, wrap the app with `InkathonProvider` from `use-inkathon` at the root level
- The `useWallet()` custom hook should be a thin wrapper around `useInkathon`'s `useInstalledWallets()` + `useConnect()`
- Browser mode always uses the extension. Auto-keypair is only for CLI/agent mode (check environment: if Node.js, use auto-keypair; if browser, use extension)
- Test edge cases: missing extension, revoked permissions, wrong chain connected
