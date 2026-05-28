# 02 — Sponsor Docs: Portaldot Technical Reference

**Research date:** 2026-05-26

---

## Chain Info (VERIFIED)

| Key | Value |
|---|---|
| Mainnet WSS | `wss://mainnet.portaldot.io` |
| SS58 format | 42 |
| Token | POT |
| Decimals | 14 |
| Local dev WSS | `ws://127.0.0.1:9944` |
| Explorer | https://www.portaldot.io (select "Local Node") |

**No public testnet faucet documented.** Local dev node is the development path.

---

## Python SDK

**Install:** `pip install substrate-interface`  
**Docs:** https://portaldot-dev.readthedocs.io/en/latest/python-sdk/Install.html

### Connection

```python
from substrateinterface import SubstrateInterface

portaldot = SubstrateInterface(
    url="wss://mainnet.portaldot.io",
    ss58_format=42,
    type_registry_preset='default'
)

# Local dev
portaldot = SubstrateInterface(url="ws://127.0.0.1:9944")
```

### Key Operations (confirmed in docs)

```python
# Query balance
result = portaldot.query('System', 'Account', ['<address>'])
free_balance = result.value['data']['free']

# Transfer
call = portaldot.compose_call(
    call_module='Balances',
    call_function='transfer_keep_alive',
    call_params={'dest': '<address>', 'value': 1 * 10**12}
)
keypair = Keypair.create_from_uri('//Alice')
extrinsic = portaldot.create_signed_extrinsic(call=call, keypair=keypair)
receipt = portaldot.submit_extrinsic(extrinsic, wait_for_inclusion=True)
```

### Confirmed Examples in Docs
- Batch call
- Fee info
- Query mapped storage
- Multisig transaction
- **Create and call ink! contract** ← key primitive
- Historic balance
- Block headers subscription
- Storage subscription
- Subscribe to multiple storage keys

---

## Smart Contracts: ink! (RISK FLAG)

**ink! was formally discontinued by Parity/W3F in January 2026.** No further development from the official team. The language and existing contracts still work, but there's no forward momentum and bugs will not be patched officially.

**For this hackathon:** The docs explicitly reference ink! contract creation via Python SDK. The hackathon judging requires "Portaldot Native Deployment" using POT as gas — ink! on their contracts pallet remains the mechanism. This risk does not block a 4-day build.

### ink! Contract Interaction via Python SDK

From docs (confirmed):
```python
# Contract deployment + interaction via substrate-interface
# Full example at: https://portaldot-dev.readthedocs.io/en/latest/python-sdk/Examples.html#create-and-call-ink-contract
```

### Available Pallets (confirmed from module-interface docs)
- balances
- staking
- contracts (ink! WASM)
- multisig
- identity
- proxy
- bounties
- treasury
- vesting
- babe / grandpa (consensus)

---

## Local Development Setup

```bash
# 1. Download binary (Ubuntu)
wget https://github.com/portaldotVolunteer/Portaldot-node/raw/main/portaldot-testnet-ubuntu.tar.gz
tar -xzvf portaldot-testnet-ubuntu.tar.gz
cd portaldot-testnet-ubuntu
chmod 755 portaldot_dev

# 2. Run local dev node
./portaldot_dev --dev --alice

# 3. Connect
# SDK: url="ws://127.0.0.1:9944"
# Explorer: portaldot.io → Select "Local Node"
```

---

## GitHub

- `portaldotVolunteer/Portaldot` — actual chain source code (Substrate fork, 8 commits)
  - Has `bin/`, `client/`, `frame/`, `primitives/` etc. — real Substrate structure
  - Also has `pot_mainnet_spec_raw.json` — mainnet genesis spec

---

## Open Questions (Still Unverified)

1. No faucet for mainnet POT — how do participants get POT to pay gas? (Local dev node has Alice/Bob test accounts)
2. Exact ink! version supported by Portaldot contracts pallet
3. Any Portaldot-specific Discord/Telegram for builder support during hackathon
4. Whether mainnet is actually accessible or builders are expected to use local dev node only
