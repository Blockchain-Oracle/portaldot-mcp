#!/usr/bin/env bash
# Single green-light gate. Exit 0 = done. Anything else = keep working.
# Defensive: before the monorepo is installed, it passes (nothing to check yet).
set -uo pipefail
cd "$(dirname "$0")/../.." || exit 1

if [ ! -f package.json ] || [ ! -d node_modules ]; then
  echo "⏳ monorepo not installed yet — green-light skipped"
  exit 0
fi

fail=0
step() {
  local name="$1"; shift
  echo "▶ $name"
  if ! "$@"; then echo "  ✗ $name failed"; fail=1; fi
}

step build     pnpm -s -r --if-present run build
step lint      pnpm -s -r --if-present run lint
step typecheck pnpm -s -r --if-present run typecheck
step test      pnpm -s -r --if-present run test

if [ "$fail" -eq 0 ]; then echo "✅ green"; else echo "❌ red"; fi
exit "$fail"
