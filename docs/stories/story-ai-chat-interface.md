# Story: AI Chat Interface

**ID:** story-ai-chat-interface  
**Epic:** Epic 4 — AI Chat Interface  
**Estimated time:** 1h  
**Depends on:** story-mcp-write-tools  

---

## User story

As a user of portaldot-mcp web app,  
I want to type natural language requests in a chat box,  
So that Claude can interpret my intent and dispatch to the correct MCP tool.

---

## Acceptance criteria (BDD)

```
Given the web app is loaded at localhost:3000
When the chat interface renders
Then a message list is visible (empty on first load) and an input bar is at the bottom

Given the user types "what's my balance?" and presses Enter
When the message is submitted
Then it appears in the chat (left-aligned, user style) with a timestamp

Given the user message is submitted
When the MCP client forwards it to Claude via /api/chat endpoint
Then Claude responds with streaming text
And the AI response appears character-by-character (streaming effect)

Given Claude identifies a tool call (e.g., portaldot_get_balance)
When the tool is invoked
Then a skeleton card appears while the tool runs
And the skeleton is replaced with the real result card when complete

Given the chat has 3+ messages
When new messages arrive
Then the message list auto-scrolls to the bottom
And older messages remain in history (scrollable)

Given the user closes and reopens the browser
When they return to the app
Then the chat history is preserved (stored in localStorage or sessionStorage)

Given pnpm test runs on the chat tests
Then at least 8 test cases pass (render, submit message, stream handling, tool skeleton, auto-scroll, history persistence, error handling, empty state)
```

---

## File modification map

- `apps/web/app/api/chat/route.ts` — NEW — Vercel AI SDK chat endpoint
  - Uses `streamText()` from `ai` package
  - Passes MCP tools via `tools` parameter
  - Uses Claude `claude-sonnet-4-6` model
  - Streams response back to client
- `apps/web/components/chat/ChatInterface.tsx` — NEW — root chat container
- `apps/web/components/chat/MessageList.tsx` — NEW — renders messages with auto-scroll
- `apps/web/components/chat/InputBar.tsx` — NEW — text input + send button (Enter to send)
- `apps/web/lib/mcp-client.ts` — UPDATE — MCP client via `@ai-sdk/mcp` StreamableHTTPClientTransport
  - Points to local `/api/mcp` endpoint during dev
  - Points to Vercel endpoint in production
- `apps/web/hooks/useChat.ts` — NEW or wrapper around Vercel AI SDK's useChat
  - Manages messages state
  - Handles streaming
  - Exposes `messages`, `input`, `setInput`, `handleSubmit`, `isLoading`
- `apps/web/app/page.tsx` — UPDATE — renders ChatInterface
- `apps/web/__tests__/chat.test.tsx` — NEW — vitest + React Testing Library, ≥8 cases

---

## Shell verification

```bash
cd apps/web
npm run test -- __tests__/chat.test.tsx
# Output: "8 passed"

npm run build
# Verify no TypeScript errors

npm run dev &
sleep 3
# Open localhost:3000 in browser, verify chat UI loads
kill %1
```

---

## Notes for coding agent

- Vercel AI SDK's `useChat()` hook handles the streaming + tool dispatch automatically
- The `/api/chat` route receives user message and returns streamed response from Claude
- MCP client is initialized in `lib/mcp-client.ts` with HTTP transport (for Vercel compatibility)
- Tool definitions are passed to `streamText()` — Claude reads the tool descriptions and decides when to call them
- Streaming UI: use `useChat` which handles character-by-character streaming automatically
- localStorage for history: save messages array after each user message (key: `portaldot-chat-history`)
- Tests: mock the Claude response, mock MCP tool returns, test streaming UI updates
- Error handling: if MCP server is unreachable, show a connection error message in the chat
