# SDK Snippets — Portaldot Python SDK

Source: https://portaldot-dev.readthedocs.io/en/latest/python-sdk/

## Install
```bash
pip install substrate-interface
```

## Connect to Mainnet
```python
from substrateinterface import SubstrateInterface, Keypair

portaldot = SubstrateInterface(
    url="wss://mainnet.portaldot.io",
    ss58_format=42,
    type_registry_preset='default'
)
```

## Connect to Local Dev Node
```python
portaldot = SubstrateInterface(url="ws://127.0.0.1:9944")
```

## Run Local Dev Node (Ubuntu)
```bash
wget https://github.com/portaldotVolunteer/Portaldot-node/raw/main/portaldot-testnet-ubuntu.tar.gz
tar -xzvf portaldot-testnet-ubuntu.tar.gz
cd portaldot-testnet-ubuntu
chmod 755 portaldot_dev
./portaldot_dev --dev --alice
```

## Balance Query
```python
result = portaldot.query('System', 'Account', ['<SS58_ADDRESS>'])
free_balance = result.value['data']['free']  # raw, divide by 10**14 for POT
```

## Transfer (Balance Extrinsic)
```python
call = portaldot.compose_call(
    call_module='Balances',
    call_function='transfer_keep_alive',
    call_params={
        'dest': '<RECIPIENT_ADDRESS>',
        'value': 1 * 10**12  # amount in raw units
    }
)
keypair = Keypair.create_from_uri('//Alice')  # dev; use real keypair in prod
extrinsic = portaldot.create_signed_extrinsic(call=call, keypair=keypair)
receipt = portaldot.submit_extrinsic(extrinsic, wait_for_inclusion=True)
print(f"Tx: {receipt.extrinsic_hash} in block {receipt.block_hash}")
```

## Create Keypair
```python
# From mnemonic
keypair = Keypair.create_from_mnemonic("word1 word2 ... word12")
print(keypair.ss58_address)

# Generate new
keypair = Keypair.generate_mnemonic()
```

## Block Headers Subscription (for real-time feed)
```python
def on_block(header):
    print(f"New block: {header['number']}")

portaldot.subscribe_block_headers(on_block)
```

## Storage Subscription (watch an account)
```python
def on_change(obj, update_nr, subscription_id):
    print(f"Storage update: {obj.value}")

portaldot.query('System', 'Account', ['<ADDRESS>'], subscription_handler=on_change)
```

## ink! Contract — Deploy and Call (Python SDK)
Full example: https://portaldot-dev.readthedocs.io/en/latest/python-sdk/Examples.html#create-and-call-ink-contract
(Need to scrape this page for full code — not yet captured)

## ink! Contract — Standard Flipper (ink! v5)
```rust
#[ink::contract]
mod flipper {
    #[ink(storage)]
    pub struct Flipper {
        value: bool,
    }
    impl Flipper {
        #[ink(constructor)]
        pub fn new(init_value: bool) -> Self { Self { value: init_value } }
        #[ink(message)]
        pub fn flip(&mut self) { self.value = !self.value; }
        #[ink(message)]
        pub fn get(&self) -> bool { self.value }
    }
}
```

## Multisig Transaction
```python
# Docs: https://portaldot-dev.readthedocs.io/en/latest/python-sdk/Examples.html#multisig-transaction
# Requires: threshold, signatories list, call to wrap
```

## ink! Contract — Full Deploy + Call (VERIFIED from docs)

```python
import os
from substrateinterface.contracts import ContractCode, ContractInstance
from substrateinterface import SubstrateInterface, Keypair

portaldot = SubstrateInterface(
    url="wss://mainnet.portaldot.io",
    ss58_format=42,
    type_registry_preset='default'
)
keypair = Keypair.create_from_uri('//Alice')

# Upload + Deploy
code = ContractCode.create_from_contract_files(
    metadata_file='flipper.json',  # ABI metadata
    wasm_file='flipper.wasm',      # compiled WASM
    portaldot=portaldot
)
contract = code.deploy(
    keypair=keypair,
    constructor="new",
    args={'init_value': True},
    value=0,
    gas_limit={'ref_time': 25990000000, 'proof_size': 11990383647911208550},
    upload_code=True
)
print(f'Deployed @ {contract.contract_address}')

# Gas estimate for a call
gas_result = contract.read(keypair, 'flip')
print('Gas estimate:', gas_result.gas_required)

# Execute contract call
receipt = contract.exec(keypair, 'flip', args={}, gas_limit=gas_result.gas_required)
if receipt.is_success:
    print('Events:', receipt.contract_events)

# Read contract state
result = contract.read(keypair, 'get')
print('Value:', result.contract_result_data)
```

## Batch Calls (execute multiple in one tx)
```python
call = portaldot.compose_call(
    call_module='Utility',
    call_function='batch',
    call_params={'calls': [balance_call1, balance_call2]}
)
```

## Get Fee Estimate
```python
payment_info = portaldot.get_payment_info(call=call, keypair=keypair)
print("Fee:", payment_info)
```

## Multisig (2-of-3)
```python
multisig_account = portaldot.generate_multisig_account(
    signatories=[alice.ss58_address, bob.ss58_address, charlie.ss58_address],
    threshold=2
)
extrinsic = portaldot.create_multisig_extrinsic(call, keypair_alice, multisig_account)
receipt = portaldot.submit_extrinsic(extrinsic, wait_for_inclusion=True)
```

## Historical Balance at Block
```python
block_hash = portaldot.get_block_hash(block_number=10)
result = portaldot.query("System", "Account", ["<ADDRESS>"], block_hash=block_hash)
balance = result.value["data"]["free"] + result.value["data"]["reserved"]
formatted = format(balance / 10**14, ".15g") + " POT"
```
