# Story: Generative UI Components

**ID:** story-generative-ui-components  
**Epic:** Epic 4 — AI Chat Interface  
**Estimated time:** 1.5h  
**Depends on:** story-ai-chat-interface  

---

## User story

As an AI assistant responding to a user request,  
I want to render Portaldot-specific tool results as styled cards (balance, transfer preview, blocks, tasks),  
So that the user sees a rich, branded UI instead of raw JSON.

---

## Acceptance criteria (BDD)

```
Given Claude dispatches a portaldot_get_balance tool call
When the tool returns {free: 42000000000000, reserved: 0, total: 42000000000000, formatted: '42.0000'}
Then a BalanceCard component renders showing:
  - Account icon + address (Geist Mono, truncated to 5F3sA…utQY format)
  - Free balance line
  - Reserved balance line
  - Total balance line highlighted

Given Claude dispatches a portaldot_transfer call
When the tool is in-flight (signing pending)
Then a TransferCard appears with:
  - Recipient address + amount
  - Fee estimate
  - "Sign & Send" button (disabled while signing)
  - "Cancel" button

Given the user clicks "Sign & Send" on a TransferCard
When the browser wallet extension approves the tx
Then the card transitions to confirmed state:
  - Checkmark icon
  - Tx hash (0x1234…abcd format)
  - "View on Explorer" link
  - Card border turns green

Given Claude calls portaldot_get_block_info with blockNumber=1234567
When the tool returns block data
Then a BlockInfoCard shows:
  - Block number
  - Block hash
  - Timestamp (human-readable, e.g. "May 26, 2:45 PM")
  - Extrinsic count

Given Claude calls portaldot_call_contract to create a task
When the tool returns {txHash, events}
Then a TaskCreatedCard shows:
  - Task ID (from event)
  - Task description
  - Tx hash with explorer link
  - Status (pending/confirmed)

Given all five card types are rendered
When the chat history is scrolled
Then no layout shifts occur and cards render consistently (odiff < 2% vs anchor)

Given npm test runs on the components test suite
Then at least 15 test cases pass (BalanceCard render, TransferCard states, BlockInfoCard format, TaskCreatedCard, skeleton loading, error states, click handlers)
```

---

## File modification map

- `apps/web/components/tools/BalanceCard.tsx` — NEW — balance display card
- `apps/web/components/tools/TransferCard.tsx` — NEW — transfer preview + confirmation card
- `apps/web/components/tools/BlockInfoCard.tsx` — NEW — block info card
- `apps/web/components/tools/TaskCreatedCard.tsx` — NEW — task creation confirmation card
- `apps/web/components/tools/TaskListCard.tsx` — NEW — task list display
- `apps/web/components/tools/SkeletonCard.tsx` — NEW — pulsing skeleton while tool is loading
- `apps/web/components/tools/index.ts` — NEW — exports all card components
- `apps/web/__tests__/tools.test.tsx` — NEW — vitest + RTL, ≥15 cases
- `apps/web/lib/tool-components.ts` — NEW — maps tool names to card components
  - `getToolComponent(toolName, result)` → returns React component
  - Used by ChatInterface to render tool results generatively

---

## Shell verification

```bash
cd apps/web
npm run test -- __tests__/tools.test.tsx
# Output: "15 passed"

npm run build
# Verify no errors

# Visual regression check (if anchor is set up)
pnpm tsx scripts/capture-anchor.ts http://localhost:3000 tools
# Compare against screenshots/anchor/tools*.png with odiff
```

---

## Notes for coding agent

- All cards use the design tokens from `docs/ux-spec.md` (colors, fonts, spacing)
- Card styling: shadcn/ui Card component + Tailwind (no inline styles)
- Font handling: Geist Sans for body text, Geist Mono for addresses/hashes (override Inter defaults)
- Addresses always truncated to format: `5F3sA…utQY` (first 5 + last 5 chars)
- Tx hashes truncated: `0x1234…abcd` (same format)
- Colors: success state = green-500, pending = amber-500, error = red-500
- TransferCard wallet signing: use the `useWallet()` hook from wallet.ts to call `signAndSend()`
- SkeletonCard: subtle pulsing animation (use Tailwind `animate-pulse`)
- No gradients or unnecessary visual effects — keep it clean and professional
- Tests must verify all card props render correctly, state transitions work, and click handlers fire
