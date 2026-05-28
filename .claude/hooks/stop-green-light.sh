#!/usr/bin/env bash
# Stop hook: refuse to end the turn while green-light is red.
# Defensive green-light returns 0 before scaffold and when green, so this only
# blocks on a genuine build/lint/type/test failure.
cd "$(dirname "$0")/../.." || exit 0
out=$(bash .claude/scripts/green-light.sh 2>&1)
code=$?
if [ "$code" -ne 0 ]; then
  reason=$(printf '%s' "$out" | tail -6 | tr '\n' ' ' | sed 's/"/\\"/g')
  printf '{"decision":"block","reason":"green-light is RED — fix before stopping: %s"}' "$reason"
fi
exit 0
