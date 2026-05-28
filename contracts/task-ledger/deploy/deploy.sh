#!/usr/bin/env bash
# Deploy the Task Ledger ink! contract and print its on-chain address.
#   PORTALDOT_RPC_URL  endpoint (default ws://127.0.0.1:9944 devnet; set to wss://mainnet.portaldot.io for mainnet)
#   DEPLOY_SURI        signer (default //Alice for devnet; a funded seed for mainnet)
set -euo pipefail
[ -f "$HOME/.cargo/env" ] && source "$HOME/.cargo/env"

HERE="$(cd "$(dirname "$0")/.." && pwd)"
RPC="${PORTALDOT_RPC_URL:-ws://127.0.0.1:9944}"
SURI="${DEPLOY_SURI:-//Alice}"
cd "$HERE"

echo "Deploying task_ledger (constructor new) to $RPC as $SURI ..." >&2
OUT=$(cargo contract instantiate --constructor new --suri "$SURI" --url "$RPC" -x --skip-confirm --output-json 2>/dev/null || true)

ADDR=$(printf '%s\n' "$OUT" | python3 -c '
import sys, json
addr = None
def walk(o):
    global addr
    if isinstance(o, dict):
        for k, v in o.items():
            if k.lower() in ("contract", "address", "account") and isinstance(v, str) and v.startswith("5"):
                addr = v
            walk(v)
    elif isinstance(o, list):
        for x in o:
            walk(x)
for line in sys.stdin.read().splitlines():
    line = line.strip()
    if not line:
        continue
    try:
        walk(json.loads(line))
    except Exception:
        pass
print(addr or "")
')

if [ -z "$ADDR" ]; then
  echo "ERROR: could not parse deployed contract address. Raw output:" >&2
  printf '%s\n' "$OUT" | tail -20 >&2
  exit 1
fi
echo "$ADDR"
