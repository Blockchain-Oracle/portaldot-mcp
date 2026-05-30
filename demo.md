# demo

A walk-through of portaldot-mcp — the MCP server and the generative-UI web app, both
talking to the real Portaldot mainnet.

> Live app: <https://portaldot-mcp.vercel.app> · npm: [`portaldot-mcp`](https://www.npmjs.com/package/portaldot-mcp)

---

## Chat in action

End-to-end: plain-language question, generated tool call, signed transaction, finalized receipt.

![portaldot chat — end-to-end transfer flow](./assets/demo.gif)

---

## Landing

The marketing surface — the instrument-panel hero with the violet→cyan wave field,
live mainnet block ticker, and the AI input that drops you into `/app` with the
prompt prefilled.

![portaldot landing — hero with live block ticker](./assets/screen-landing.png)

---

## App — wallet gate

The one glass surface in the app. Lives only until your wallet is picked. Live
mainnet block updates even before you connect.

![portaldot wallet gate — insert credentials](./assets/screen-wallet-gate.png)

---

## App — wallet picker

Four mainstream Polkadot wallets detected from `window.injectedWeb3`. Per-wallet
selection routes signing through `web3FromSource` so the right extension signs.

![portaldot wallet picker — SubWallet · Talisman · Polkadot{.js} · Nova](./assets/screen-wallet-picker.png)

---

## App — connected chat

Receipt-card chrome on every tool result: meta-strip, perforation, watermark.
Balance carries a Polkadot identicon, ramped-up POT number, and a QR of your
address. Transfer flagship gets a `PAID` stamp on finalization.

![portaldot chat — balance card with identicon + QR](./assets/screen-balance.png)

![portaldot chat — confirmed transfer with PAID stamp](./assets/screen-transfer-paid.png)

---

## Sidebar

The sidebar is a prompt launcher — each card shows the prompt text it would
fire, filterable. Footer carries the live mainnet block and your identicon.

![portaldot sidebar — prompt launcher](./assets/screen-sidebar.png)

---

## Docs

In-app tool catalog at <https://portaldot-mcp.vercel.app/docs/tools> covers all
34 MCP tools — every one schema-typed, every one hitting the real chain.

![portaldot docs — tool catalog](./assets/screen-docs.png)

---

## Reproduce locally

```bash
pnpm install
pnpm dev:mcp     # the MCP server (stdio)
pnpm dev:web     # the web app (Next.js on :3000)
```

Then visit <http://localhost:3000>.
