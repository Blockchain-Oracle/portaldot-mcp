# Portaldot Web Layer Architecture Research
**Date:** 2026-05-26  
**Scope:** Client-side MCP + Generative UI + Wallet Signing for Portaldot AI Agent (Track 4)

---

## TL;DR

Five-layer stack: **React frontend (useChat) → Next.js streaming API → MCP client → Portaldot MCP server (Node) → Portaldot WSS**. Wallet signing stays in the browser via injected extension (SubWallet/Talisman). AI proposes, user signs — no custodial risk. Use PAPI or `@polkadot/extension-dapp` for chain interaction.

---

## 1. Vercel AI SDK Patterns (Generative UI + Tool Calling)

**Current stable version:** AI SDK 5.0 (released mid-2025), SDK 6.0 adds `needsApproval` flag  
**Key source:** https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces

### What Works (use this)

```typescript
// Client: useChat hook maps tool calls to components
'use client';
import { useChat } from '@ai-sdk/react';

const { messages, sendMessage } = useChat({ api: '/api/chat' });

// Check tool call parts in SDK 5: parts use typed naming tool-${toolName}
messages.map(msg => msg.parts.map(part => {
  if (part.type === 'tool-transferPOT') return <TransferConfirmUI {...part.args} />;
  if (part.type === 'tool-checkBalance') return <BalanceCard {...part.result} />;
}));
```

```typescript
// Server: streamText with tools + MCP client
import { streamText, tool } from 'ai';
import { createMCPClient } from '@ai-sdk/mcp';

const mcpClient = await createMCPClient({
  transport: { type: 'http', url: 'http://localhost:3001/mcp' }
});

const result = streamText({
  model: 'anthropic/claude-sonnet-4-6',
  tools: { ...await mcpClient.tools() },
  prompt: userInput,
  onFinish: () => mcpClient.close(),
});
```

### What NOT to Use

- ❌ **Vercel AI SDK RSC (`streamUI` / `createStreamableUI`)** — development paused as of 2026, not maintained
- ❌ AI SDK `experimental_createMCPClient` name — it's now `createMCPClient` from `@ai-sdk/mcp`
- ✅ Use client-side `useChat` hook for all generative UI

### AI SDK + MCP Integration Pattern

The SDK's `createMCPClient` supports:
- `{ type: 'stdio', command, args }` — local dev only
- `{ type: 'http', url }` — Streamable HTTP (production, browser-accessible)

Tools from MCP server integrate directly with `generateText`/`streamText` via `.tools()` method.

---

## 2. Browser/Client-Side MCP Transport Patterns

**Key sources:** https://modelcontextprotocol.io/specification/2025-11-25/basic/transports + https://brightdata.com/blog/ai/sse-vs-streamable-http

### Protocol History

| Version | Transport |
|---|---|
| Pre-2025 | HTTP + SSE (deprecated) |
| 2025-03-26+ | **Streamable HTTP** (current standard) |

### Streamable HTTP (What to Build With)

Single endpoint (`/mcp`), client POSTs JSON-RPC requests. Server can:
- Return `202 Accepted` and optionally upgrade to SSE stream for long responses
- One endpoint, bidirectional via optional SSE

```
Browser → POST /mcp (initialize, tool calls)
Server  → 200 JSON or SSE stream (for streaming results)
```

**Security requirements per spec:**
- Validate `Origin` header (prevent DNS rebinding)
- Bind dev server to `localhost` only
- Implement auth on all connections

### WebMCP (Experimental — Do NOT build on for production)

Google Chrome experimental feature where web pages expose MCP tools client-side via JS. As of May 2026: early preview, Chrome only, not a web standard. Skip for this hackathon.

### Recommended Pattern for Portaldot

Browser never connects directly to the MCP server. Instead:
```
Browser → /api/chat (Next.js API route, streams via SSE)
Next.js  → createMCPClient(Streamable HTTP) → Portaldot MCP Server
```

This avoids CORS issues and keeps chain RPC credentials server-side.

---

## 3. Polkadot Wallet Options for Browser Signing

**Key sources:** SubWallet docs, polkadot-js extension GitHub, PAPI forum

### The `window.injectedWeb3` Pattern (Universal)

All Polkadot ecosystem wallets use the same injection interface:

```typescript
import { web3Enable, web3Accounts, web3FromAddress } from '@polkadot/extension-dapp';

// Enable all injected wallets
const extensions = await web3Enable('Portaldot AI Agent');

// Get accounts across all connected wallets
const accounts = await web3Accounts();

// Get signer for a specific account
const injector = await web3FromAddress(selectedAccount.address);

// Sign + submit (with PAPI)
await api.tx.balances.transferAllowDeath(to, amount).signAndSend(
  selectedAccount.address,
  { signer: injector.signer }
);
```

### Wallet Options

| Wallet | Key | UX | Notes |
|---|---|---|---|
| **SubWallet** | `subwallet-js` | ⭐ Best | 150+ networks, MetaMask-compatible mode, most active |
| **Talisman** | `talisman` | ⭐ Good | Clean UI, Polkadot + Ethereum |
| **Polkadot.js** | `polkadot-js` | Dev-only | Technical, not user-friendly |
| **Nova** | (mobile) | Mobile | App-based, not desktop extension |

**For Portaldot hackathon:** Target SubWallet first (most users), fall back to Talisman and polkadot-js. Package: `@polkadot/extension-dapp`.

### Multi-wallet Onboarding (Optional Polish)

`@subwallet-connect/core` — mirrors MetaMask's web3-onboard pattern with SubConnect-v2. Shows wallet selection modal, handles connection flow. Good for UX but adds complexity.

### Modern Chain Library: PAPI vs polkadot.js

| | polkadot.js (`@polkadot/api`) | **PAPI (`polkadot-api`)** |
|---|---|---|
| TypeScript | Loose | ✅ Auto-generated types per chain |
| Bundle size | Heavy | ✅ Modular, tree-shakeable |
| Light client | Basic | ✅ Light-client-first |
| Breaking changes | Frequent | ✅ None since stable release (14mo) |
| Status | Maintenance mode | ✅ Actively developed |

**Recommendation:** Use PAPI (`npm i polkadot-api`) for the Portaldot build. It supports `window.injectedWeb3` via `getInjectedExtensions()` / `connectInjectedExtension()`.

```typescript
import { createClient } from 'polkadot-api';
import { getSmProvider } from 'polkadot-api/sm-provider';
import { getWsProvider } from 'polkadot-api/ws-provider/web';
import { connectInjectedExtension } from 'polkadot-api/pjs-signer';

const client = createClient(getWsProvider('wss://mainnet.portaldot.io'));
const api = client.getTypedApi(portaldot); // generated descriptors

// Connect SubWallet for signing
const subwallet = await connectInjectedExtension('subwallet-js');
const accounts = subwallet.getAccounts();
```

---

## 4. Auto-Created Wallets vs User-Owned Private Keys

### Security Comparison

| Approach | Custody | Key Storage | Risk Profile |
|---|---|---|---|
| **Injected extension** (SubWallet, Talisman) | Non-custodial | Browser extension encrypted store | JS supply chain attacks; user loses seed = lost funds |
| **Auto/embedded wallet** (Privy, Turnkey) | Semi-custodial | SSS/TSS/TEE on third-party infra | Platform disappears = key access at risk; regulatory custodian designation |
| **Server-side key** | Fully custodial | App server/KMS | Highest risk; app developer holds funds; regulatory nightmare |

### Key Risks Per Approach

**Embedded wallets (Privy et al.):**
- SSS (Shamir Secret Sharing): splits key across multiple parties; requires threshold to reconstruct
- TSS (Threshold Signature): distributed signing, key never assembled in one place
- TEE (Trusted Execution Environment): key ops in hardware enclave
- **Risk:** Third-party dependency; if provider goes down, recovery complexity
- **Best for:** Consumer apps where UX > ownership (fiat-familiar users)

**Injected wallets:**
- JS supply chain: compromised npm packages can inject key-stealing code
- Phishing: fake wallet UIs steal seed phrases
- **Risk:** User error (lost seed) is permanent and unrecoverable
- **Best for:** Web3-native users, hackathon demos, anyone who values self-custody

### Recommendation for Portaldot AI Agent

**Use injected wallets (SubWallet/Talisman) for the hackathon build.**

Rationale:
1. The AI agent should *propose* transactions, not execute them autonomously — human-in-the-loop is safer and easier to demo
2. Injected wallets are zero-setup for judges who already have SubWallet
3. No custodial risk, no third-party API keys needed for wallet layer
4. Aligns with Track 4 judging: "AI-Powered Onchain Workflows" implies user retains control

**Auto-wallet is the wrong choice here** — adds infra complexity, introduces custodial concerns, and obscures the AI integration story.

---

## 5. Pacific MCP / Pacific Cloud MCP Pattern

**Status: UNVERIFIABLE — not found in any public source or workspace files.**

Zero results across:
- GitHub search
- npm
- Workspace markdown files
- Obsidian vault
- Abu's known project docs

**Likely interpretations:**
1. STT misrender (similar to OpenClaw→OpenCode issue): "Pacific" may be rendering of another term from a voice note
2. An internal project name not yet written to any file
3. Could refer to existing Polkadot MCP servers by different name:
   - `@polkadot-agent-kit/mcp` (elasticlabs, Sep 2025) — Polkadot Agent Kit MCP package
   - `shawntabrizi/polkadot-mcp` — MCP server for Polkadot/Kusama/Westend/Paseo
   - `niklabh/polkadot-mcp` — address validation, format conversion tools

**Action required:** Abu should clarify what "Pacific MCP / Pacific Cloud MCP" refers to. If it's an existing pattern, the closest public analogs are the polkadot-agent-kit MCP architecture.

---

## 6. Concrete Architecture Recommendation: Portaldot AI Agent

```
┌─────────────────────────────────────────────┐
│           Browser (React + Next.js)         │
│                                             │
│  useChat() ←→ AI SDK 5                     │
│  Tool call parts → React components:       │
│    <TransferConfirmUI />                    │
│    <BalanceCard />                          │
│    <ContractCallCard />                     │
│                                             │
│  window.injectedWeb3 → SubWallet signer     │
│  User signs txn BEFORE agent submits        │
└──────────────┬──────────────────────────────┘
               │ SSE stream (POST /api/chat)
               │
┌──────────────▼──────────────────────────────┐
│    Next.js API Route (/api/chat)            │
│                                             │
│  streamText({                               │
│    model: claude-sonnet-4-6,                │
│    tools: { ...mcpTools, walletSign },      │
│    system: "You are a Portaldot AI agent"   │
│  })                                         │
│                                             │
│  createMCPClient({                          │
│    transport: { type:'http',                │
│      url: process.env.MCP_SERVER_URL }      │
│  })                                         │
└──────────────┬──────────────────────────────┘
               │ POST /mcp (Streamable HTTP)
               │
┌──────────────▼──────────────────────────────┐
│   Portaldot MCP Server (Node.js)            │
│                                             │
│  Tools exposed:                             │
│    • getBalance(address)                    │
│    • buildTransfer(from, to, amount)        │
│    • callContract(address, method, args)    │
│    • getAccountHistory(address)             │
│    • getChainInfo()                         │
│                                             │
│  Uses polkadot-api (PAPI) for chain calls  │
│  Connects to wss://mainnet.portaldot.io    │
│  NO private keys stored here               │
└─────────────────────────────────────────────┘
```

### Critical Design Decisions

**Signing flow:**
1. User types: "Send 5 POT to Alice"
2. Claude calls `buildTransfer` tool → returns unsigned tx hex
3. Frontend renders `<TransferConfirmUI>` with "Approve & Sign" button
4. User clicks → SubWallet signs → frontend submits signed tx
5. MCP server optionally has a `submitSignedTx(hex)` tool to broadcast

This pattern keeps the agent advisory, not autonomous — correct for both security and judges.

**What goes in MCP server vs Next.js tools:**
- Read operations (balance, history, chain info) → MCP server tools
- Tx construction → MCP server tools (returns unsigned tx)
- Signing → browser via injected wallet (NOT in any server)
- Tx broadcast → can be either browser or a `submitSignedTx` MCP tool

### Packages

```json
{
  "frontend": [
    "ai",              // AI SDK 5
    "@ai-sdk/react",
    "@ai-sdk/anthropic",
    "@ai-sdk/mcp",
    "@polkadot/extension-dapp",
    "polkadot-api"     // PAPI for typed chain interaction
  ],
  "mcp-server": [
    "@modelcontextprotocol/sdk",
    "polkadot-api",
    "@polkadot-api/ws-provider"
  ]
}
```

---

## Sources

- Vercel AI SDK: https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces
- AI SDK MCP Tools: https://ai-sdk.dev/docs/ai-sdk-core/mcp-tools
- MCP Transports spec: https://modelcontextprotocol.io/specification/2025-11-25/basic/transports
- MCP Streamable HTTP explainer: https://auth0.com/blog/mcp-streamable-http
- SubWallet DApp integration: https://docs.subwallet.app/main/integration/integration-instructions
- SubConnect-v2: https://github.com/Koniverse/SubConnect-v2
- PAPI rationale: https://forum.polkadot.network/t/why-polkadot-api/15468
- PAPI docs: https://docs.polkadot.com/reference/tools/papi
- Embedded wallets (Privy): https://www.privy.io/embedded-wallets-101
- Generative UI frameworks 2026: https://medium.com/@akshaychame2/the-complete-guide-to-generative-ui-frameworks-in-2026-fde71c4fa8cc
- polkadot-agent-kit MCP: https://www.npmjs.com/package/@polkadot-agent-kit/mcp
- shawntabrizi/polkadot-mcp: https://github.com/shawntabrizi/polkadot-mcp
