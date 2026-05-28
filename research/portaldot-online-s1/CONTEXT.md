# CONTEXT.md — Portaldot Mini Hackathon Online S1

**For any agent loading this folder:** Read this file first. Everything you need to act is here.

> **UPDATE 2026-05-28 (Claude, local Mac):** This folder was imported from Abu's two research gists and verified independently. **Deadline May 31 00:00 UTC = ~3 days left** (the body below was written 2026-05-26 and says "4-5 days"). Read **`08-independent-verification.md`** for detail. Headlines:
> - ✅ **Mainnet is LIVE** — direct WSS handshake returned chain "Portaldot Mainnet", `{ss58:42, decimals:14, POT}`, 13 peers, 306 KB metadata. `@polkadot/api` works with zero custom types.
> - ✅ **"Pacific MCP" = `Blockchain-Oracle/pacifica-mcp`** (Abu's repo) — proven monorepo + auto-wallet pattern to follow. Reconcile build to its shape (`packages/cli` core + `packages/mcp` + `packages/web` + `packages/skills`).
> - ⚠️ **Rust/cargo-contract MISSING locally** — needed to build the ink! contract.
> - ⚠️ **Unreconciled spec contradiction:** `docs/architecture.md` says `@polkadot/api`+useInkathon+AI SDK 6; `web-layer-architecture.md` says PAPI+AI SDK 5. Decide before building.
> - ⚠️ `docs/epics.md` references `story-vercel-deploy` but that story file is **missing** (9 of 10 present).

---

## What This Hackathon Is

Portaldot Mini Hackathon Online Season 1 — a first-ever lightweight hackathon by the Portaldot team on DoraHacks. Portaldot is a Substrate-based Layer-0 blockchain (POT native token, 14 decimals, SS58:42). Mainnet has been live since 2021 but has almost no ecosystem apps. The hackathon is their attempt to bootstrap developer activity.

**Deadline: May 31, 2026 00:00 UTC** — approximately 4-5 days from May 26.  
**Prize: $3,500 USDT total** (per-place split not published)  
**Submissions as of May 26: 0 visible** (organizer cited 6 early, unindexed)

---

## Target Track

**Track 4: AI-Powered Onchain Workflows**

Rationale: Abu's AI-first brand, prior Polkadot winner pattern (dAppForge, Dot Transport Intel), widest judging latitude, clearest differentiation against shill-community competition.

Backup: **Track 2: Builder Tools** (if contract layer proves unstable)

---

## Key Verified Facts

| Item | Value | Source |
|---|---|---|
| Mainnet WSS | `wss://mainnet.portaldot.io` | chain-info docs |
| SS58 format | 42 | chain-info docs |
| POT decimals | 14 | chain-info docs |
| Python SDK | `pip install substrate-interface` | SDK docs |
| Local dev node | `portaldot_dev --dev --alice` | getting-started docs |
| Contract support | ink! WASM (contracts pallet) | module-interface docs |
| GitHub (volunteer) | portaldotVolunteer/Portaldot | GitHub |
| Node binary | portaldotVolunteer/Portaldot-node | GitHub |

**ink! RISK FLAG:** ink! language was formally discontinued by Parity/W3F in January 2026. Existing contracts still work; no patch support going forward. Does not block a 4-day build but is worth noting for post-hackathon planning.

---

## Recommended Wedge (for Abu to approve)

### Primary: "Portaldot AI Agent" — natural language onchain execution (Track 4)

**What it is:** A web UI where a user types what they want ("send 5 POT to this address", "show my transaction history", "schedule a recurring payment") and an AI layer (Claude) interprets + executes it against Portaldot mainnet via the Python SDK.

**Why it wins:**
- dAppForge pattern (AI + Substrate = funded, wins top prize)
- Directly answers Track 4 criteria: "Real workflow improved by AI/automation"
- Uses both Python SDK + ink! contract (scheduling contract for recurring payments)
- Live demo is clean: type → execute → show result onchain
- Zero competition in this lane

**Minimum viable demo (4 days):**
- Natural language → balance check / transfer / contract call
- Connect to `wss://mainnet.portaldot.io` or local dev node
- Web frontend (React or Next.js)
- Claude API as the intent-parsing layer
- Python SDK (`substrate-interface`) as the execution layer
- One ink! contract: a simple transaction scheduler or multi-sig helper

### Backup: "Portaldot DevKit" (Track 2)

**What it is:** One-command developer setup CLI + block mini-explorer + example contracts gallery. Fills the documented gap (no starter templates, broken docs pages).

**Use this if:** mainnet connection is unstable and the judging team prefers tooling over AI UX.

---

## What Exists in the Field

No analyzable submissions. Gallery is empty. Pattern extrapolation from Polkadot ecosystem (same tech):
- Most prior Substrate hackathon projects: identity, DAO, payments
- AI tooling consistently wins at higher levels and converts to post-hackathon funding

---

## Available Primitives

| Primitive | Status | Use in build |
|---|---|---|
| Python SDK (`substrate-interface`) | ✅ Verified | Backend execution layer |
| Mainnet WSS | ✅ Verified | Connect to live chain |
| Local dev node | ✅ Verified | Development + testing |
| ink! contracts | ✅ With risk flag | Scheduling / multisig contract |
| Balances pallet | ✅ | Transfers, balance queries |
| Identity pallet | ✅ | Track 3 if pivoting |
| Multisig pallet | ✅ | Advanced agent patterns |

---

## Open Questions (Not Yet Verified)

1. Is mainnet POT accessible without a faucet? (Local dev Alice/Bob test accounts exist)
2. What version of ink! does Portaldot's contracts pallet support?
3. Is there a Portaldot Discord/Telegram for builder support?
4. Exact per-track prize split

---

## File Index

| File | Contents |
|---|---|
| 00-overview.md | One-page summary, all links |
| 02-sponsor-docs.md | Chain info, Python SDK, ink!, local dev setup |
| 05-prior-winners.md | Polkadot/ink! hackathon winner patterns |
| 06-hidden-field.md | Lane saturation verdict per track |
| refs/sdk-snippets.md | Key Python SDK code snippets |
| .raw/phase1-platform.md | Raw platform scrape |
| .raw/phase2-docs.md | Raw docs pass |
| .raw/phase3-signal.md | Raw signal pass |

---

## Risk Summary

| Risk | Level | Mitigation |
|---|---|---|
| ink! discontinued | Medium | 4-day build is fine; no long-term maintenance needed |
| No faucet / mainnet POT | Medium | Use local dev node for build/test; demo can use local |
| Prize payout (opaque team) | Medium | DoraHacks provides accountability buffer |
| Competition last-minute surge | Low | Field is shill-community dominated; quality threshold is low |
| 5-day deadline | Medium | Agent builds fast; narrow wedge, single clean demo |

**Overall verdict: Proceed. Thin field + AI lane + 0 serious competition = best risk/reward in a small-prize hackathon.**
