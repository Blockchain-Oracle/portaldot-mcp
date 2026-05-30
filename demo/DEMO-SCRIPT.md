# portaldot-mcp — Demo Video Script

Plain spoken script. ~3 minutes. No scene direction — just what to say.

---

## Intro

Hey — I'm Abu, and I built portaldot-mcp. It's the first MCP server for Portaldot, a Substrate Layer-0 chain. It lets any AI agent read state and sign transactions on Portaldot in plain language, and it ships with a generative-UI web app for people who don't run an MCP client.

## The problem

If you've ever wanted to actually use a Substrate chain, you know what the day looks like. You open Polkadot.js Apps. You pick a pallet. You pick an extrinsic. You hand-fill the parameters in their JSON shape. You estimate the fee. You sign. You wait for finalization. You read the event you actually care about out of a list of forty of them.

That's the path to interact with Portaldot today. It works. It's also the reason most people who hold POT never touch anything more advanced than a transfer.

And if you're an AI agent? Forget it. There's no MCP server. There's no schema-typed surface a model can call. If you want an agent to send POT or check a balance, you write the SDK glue yourself, every time.

## The solution

portaldot-mcp is the bridge.

You install it once. Either into your MCP client — Claude Code, Cursor, Claude Desktop, the console — or you skip the client entirely and open the web app. Either way, you get the same 34 tools: balances, blocks, fees, validators, staking, identity, transfers, batches, and an ink! Task Ledger contract.

You ask in plain language. The model picks the right tool. The tool hits the real Portaldot chain. The result streams back as a typed receipt — not a wall of JSON. If a transfer needs your signature, the web app surfaces a card with the preview, and your wallet — SubWallet, Talisman, Polkadot.js, or Nova — signs it locally. The server never sees a key.

## The demo

I'll show you the web app. Live on Portaldot mainnet.

I'm pasting in a prompt from the landing page: "Give me a full overview of my account." It drops me into the chat with the prompt prefilled, and the wallet picker opens. I pick SubWallet. The picker detects it from window-dot-injected-web-three, scopes the signer to that one wallet, and the connect lands.

The chat fires. You can watch the receipt cards print in. There's my Polkadot identicon, my balance ramped up in animated POT, a QR code of my address — the same one you'd scan to send me POT. Below that, my tokens, my tasks, my identity, all on the same receipt chrome.

Now I'll send a transfer. "Send one POT to five-Grw…" The model resolves the tool call, the preview card shows my identicon, the recipient's identicon, the QR of the recipient address, and the amount. I click "Authorize." SubWallet pops, I sign. The card crossfades — and a PAID stamp lands on the receipt the moment the block does. Tx hash and block hash are clickable through to Subscan.

That's the whole loop. Plain language in, signed transaction out, receipts the whole way.

## Where to find it

The MCP server is on npm — `portaldot-mcp`. One line into Claude Code.

The web app is at `portaldot-mcp.vercel.app`. The docs are at `portaldot-mcp.vercel.app/docs`. The 34-tool catalog is at `portaldot-mcp.vercel.app/docs/tools`. The repo is open source at `github.com/Blockchain-Oracle/portaldot-mcp`.

Built on `@polkadot/api`, the Model Context Protocol SDK, the Vercel AI SDK, Next.js, and ink! v5. Portaldot Mini Hackathon Online S1, Track 4. Thanks for watching.
