# Portaldot Mini Hackathon Online Season 1 — Phase 2 Sponsor Docs Research

**Research Date:** 2026-05-26  
**Subject:** Portaldot blockchain — technical overview for hackathon track design  
**Status:** Preliminary (several key testnet details unverified)

---

## Executive Summary

Portaldot is a **Substrate-based blockchain** with **POT** as its native gas/governance token. The ecosystem strongly encourages **Rust/Ink!/WASM smart contract development** and is built on interoperability primitives. The official developer documentation site exists but is incomplete (many 404s on subpages). Official repository code is minimal/empty. Critical developer tooling (testnet RPC, faucet, block explorer URLs) not yet publicly discoverable.

---

## Chain Architecture

**Type:** Substrate-based custom blockchain  
**Smart Contract Support:** 
- **Primary:** ink! (Substrate's WASM smart contracts in Rust)
- **Secondary:** Potentially pallet-contracts module (standard Substrate contracts pallet)
- **EVM:** No evidence of EVM compatibility found

**Consensus/Architecture Notes:**
- Described as a "cross-chain interoperability meta-protocol" and "Layer 0 infrastructure"
- Mainnet launch: September 2021
- Token-gated governance and transaction fees via POT

---

## Testnet Details (UNVERIFIED — NEEDS LIVE CONFIRMATION)

| Item | Value | Status |
|------|-------|--------|
| **Testnet RPC URL** | NOT FOUND | ⚠️ Unverified |
| **Block Explorer** | NOT FOUND | ⚠️ Unverified |
| **Faucet URL** | NOT FOUND | ⚠️ Unverified |
| **Chain ID** | NOT FOUND | ⚠️ Unverified |
| **SS58 Prefix** | NOT FOUND | ⚠️ Unverified |

**Note:** Standard Substrate testnet URLs (if they follow pattern `portaldot-testnet-rpc.xyz` or similar) should be tested directly. ReadTheDocs site references `/getting-started/` and `/api/` but those pages return 404s.

---

## Official Documentation & Resources

### Official Site
- **URL:** https://www.portaldot.io/
- **Status:** Site loads but appears to require JavaScript rendering; basic info only
- **Content:** References testnet RPC, block explorer, faucet, developer resources, tutorials — **but actual URLs not accessible via plain fetch**

### Developer Documentation (ReadTheDocs)
- **URL:** https://portaldot-dev.readthedocs.io/en/latest/
- **Main page:** Accessible — confirms Python SDK, ink! contract support, references many pallets (balances, staking, contracts, multisig, identity, etc.)
- **Subpages:** Most return 404:
  - `/getting-started/` — 404
  - `/smart-contracts/` — 404
  - `/api/` — 404
  - `/tutorials/` — 404

### GitHub
- **Organization:** https://github.com/Portaldot
- **Public Repos:**
  1. **Portaldot** (main repo) — Empty (created 2021-06-19, no commits)
  2. **whitepaper** — Contains PDF but content not accessible via web fetch

---

## Available Pallets & Primitives (Inferred from docs)

From the ReadTheDocs navigation and Substrate ecosystem norms, Portaldot likely includes:
- **Balances** — Token transfers and account balances
- **Staking** — Validator/delegator staking
- **Contracts** — WASM contract execution (ink!)
- **Multisig** — Multi-signature operations
- **Identity** — On-chain identity registration
- **Governance** — Likely governance/voting (standard Substrate pattern)

**Note:** No specialized DEX, oracle, or on-chain governance primitives explicitly confirmed. Verify against whitepaper.

---

## Smart Contract Development (ink! / WASM)

### Contract Patterns (via Context7 / ink! 6.0 docs)

Portaldot developers will use standard **ink! v5.1.1 or later** patterns:

```rust
#[ink::contract]
mod example {
    #[ink(storage)]
    pub struct MyContract {
        value: u32,
        balances: ink::storage::Mapping<AccountId, Balance>,
    }

    impl MyContract {
        #[ink(constructor)]
        pub fn new(init_value: u32) -> Self {
            Self { value: init_value, balances: Default::default() }
        }

        #[ink(message)]
        pub fn increment(&mut self) { self.value += 1; }

        #[ink(event)]
        pub struct Transferred {
            #[ink(topic)]
            from: Option<AccountId>,
            #[ink(topic)]
            to: Option<AccountId>,
            value: Balance,
        }
    }
}
```

**Key Takeaways:**
- Storage: struct with `#[ink(storage)]`
- Constructors: `#[ink(constructor)]` — supports multiple
- Messages (callable functions): `#[ink(message)]` — read-only or mutable
- Events: `#[ink(event)]` with optional `#[ink(topic)]` for indexing
- Emitting events: `Self::env().emit_event(...)` or `self.env().emit_event(...)`
- Storage collections: `ink::storage::Mapping<K, V>` for lazy-loaded key-value stores

### SDKs & Tooling

| Tool/SDK | Status | Notes |
|----------|--------|-------|
| **Rust/Cargo** | ✅ Standard | ink! contracts are pure Rust |
| **ink! CLI** | ✅ Standard | Compile, test, deploy |
| **Polkadot.js** | ✅ Likely | Query chain state, call contracts; needs custom chain metadata |
| **Python SDK** | ✅ Confirmed | Referenced in ReadTheDocs main page |
| **Swanky CLI** | ❓ Assumed | Standard Substrate WASM tooling (unverified for Portaldot) |
| **OpenBrush** | ❓ Assumed | Substrate contract library ecosystem (unverified for Portaldot) |

---

## Development Workflow (Inferred)

**Typical Portaldot ink! contract workflow:**

1. **Setup:** `cargo new my_contract --template portaldot` (or generic ink!)
2. **Write:** Rust code with ink! macros in `lib.rs`
3. **Build:** `cargo +nightly build --release --target=wasm32-unknown-unknown`
4. **Test:** `cargo +nightly test` (unit + integration)
5. **Deploy:**
   - Compile to WASM: `ink-build my_contract.wasm`
   - Upload via Polkadot.js Apps (or custom portal) to testnet RPC
   - Interact via chain frontend or direct RPC calls

---

## Starter Templates & Examples

**GitHub Search Results:**
- **Official Portaldot repos:** Empty or whitepaper-only (no starter templates found)
- **Alternative sources:**
  - Generic ink! starters: https://github.com/use-ink/ink-examples (context: standard Polkadot/Kusama reference)
  - Astar/ink! examples: https://github.com/AstarNetwork/Astar-smartcontracts (similar Substrate WASM ecosystem)
  - OpenBrush ERC20 reference: https://github.com/OpenBrush/OpenBrush-contracts (Substrate contract stdlib)

**Recommendation:** Check if Portaldot publishes templates or example contracts on their official site post-hackathon-announcement.

---

## Key APIs & On-Chain Primitives

**Confirmed Available (Substrate Standard):**
- **JSON-RPC:** Standard Substrate RPC (state_getStorage, author_submitExtrinsic, etc.)
- **Storage queries:** Key-value lookups for pallet state
- **Extrinsic calls:** Dispatchable functions from pallets
- **Event subscription:** Listen for on-chain events

**Not Confirmed:**
- Custom RPC extensions (Portaldot-specific)
- Specialized oracle APIs
- DEX/swap primitives (not mentioned in docs)
- Governance voting APIs (assumed but unverified)

**Action:** Check official docs / GitHub once more detailed docs are published.

---

## Gaps & Open Questions

### Critical (Must Verify)
1. **Is testnet live right now?** RPC endpoint not discoverable; readthedocs setup pages return 404.
2. **What is the chain ID and SS58 prefix?** Not in standard SS58 registry; not in whitepaper access.
3. **What is the exact faucet endpoint and rate limits?** Not published.
4. **Are there starter contract templates or examples?** GitHub repos are empty.
5. **What's the exact Portaldot Mini Hackathon Online Season 1 announcement/landing page?** Not indexed on major hackathon platforms yet.

### Secondary (Nice-to-Have)
1. Are there any custom RPC methods or Portaldot-specific APIs?
2. Is there an official testnet block explorer UI?
3. Are there existing contracts deployed on testnet to reference?
4. What is the Portaldot team's contact/support channel for hackathon participants?
5. Are there any governance/voting mechanics live on testnet?

---

## Recommended Next Steps (for Phase 2 → Phase 3 transition)

1. **Direct Contact:** Email Portaldot hackathon team for testnet RPC, faucet, chain ID, starter templates
2. **Whitepaper Deep Dive:** Download and parse `github.com/Portaldot/whitepaper` PDF for full architecture
3. **Live Testnet Check:** Once RPC endpoint is known, query chain via Polkadot.js Apps or custom RPC client
4. **Example Contracts:** Ask organizers if they have reference ink! contracts or if examples will be published
5. **Timeline:** Confirm hackathon schedule, submission deadlines, demo day date

---

## Sources & References

- **Official:** https://www.portaldot.io/
- **GitHub:** https://github.com/Portaldot
- **Docs (ReadTheDocs):** https://portaldot-dev.readthedocs.io/
- **ink! SDK:** https://use.ink/ ([Context7: /use-ink/ink-docs](https://context7.com/use-ink/ink-docs))
- **Substrate Framework:** https://substrate.dev
- **Polkadot Ecosystem:** https://polkadot.network
- **Coin Info:** [Coinpaprika: Portaldot (POT)](https://coinpaprika.com/coin/pot-portaldot/)

---

## Summary for Abu

**Status:** Portaldot is a real Substrate-based chain with POT token, ink! contract support, and a hackathon announced. However, the project is **low on public documentation** — testnet RPC, faucet, block explorer, and starter templates are not yet discoverable online.

**Wedge Suitability:** IF the testnet is live and accessible, this is a **solid track for Rust/ink! developers**. The interoperability angle is strong, and ink! is well-documented via the broader Polkadot ecosystem.

**Risk:** Without confirmed testnet access + working faucet + examples, the hackathon may be in early/incomplete stage. Recommend **direct outreach to Portaldot team** before committing to a build track.

---

*Generated by subagent; Phase 2 research complete.*
