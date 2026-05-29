import {
  streamText,
  convertToModelMessages,
  tool,
  stepCountIs,
  type ToolSet,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { allTools } from "@portaldot-mcp/core";
import { resolveModel } from "@/lib/model";

export const runtime = "nodejs";
export const maxDuration = 60;

// The web surface exposes read tools (server-executed, no wallet) plus a single
// write tool — transfer — which has NO execute, so the browser handles it and the
// user signs with their injected wallet ("AI proposes, user signs"). Contract
// writes are demonstrated via the MCP server, not the web.
const SERVER_EXECUTED = new Set([
  "portaldot_get_balance",
  "portaldot_get_block_info",
  "portaldot_estimate_fee",
  "portaldot_token_info",
  "portaldot_my_tokens",
  "portaldot_list_tasks",
  "portaldot_get_task",
  "portaldot_account_overview",
  "portaldot_chain_info",
  "portaldot_validators",
  "portaldot_staking_info",
  "portaldot_resolve_address",
  "portaldot_list_proxies",
  "portaldot_list_bounties",
  "portaldot_validate_address",
  "portaldot_convert_address",
]);
const CLIENT_SIGNED = new Set(["portaldot_transfer"]);

function buildTools(): ToolSet {
  const tools: ToolSet = {};
  for (const t of allTools) {
    if (!SERVER_EXECUTED.has(t.name) && !CLIENT_SIGNED.has(t.name)) continue;
    const inputSchema = z.object(t.inputShape);
    tools[t.name] = SERVER_EXECUTED.has(t.name)
      ? tool({
          description: t.description,
          inputSchema,
          execute: async (args: Record<string, unknown>) => {
            const res = await t.handler(args);
            return res.ok ? res.data : { error: res.error };
          },
        })
      : tool({ description: t.description, inputSchema }); // client-signed
  }
  return tools;
}

const SYSTEM = `You are the Portaldot agent. Portaldot is a Substrate chain; the token is POT (14 decimals, SS58 prefix 42).
Use the tools to read chain state and to propose transactions. For transfers and task-ledger writes, call the tool — the user will review and sign in their wallet. Keep replies short; let the tool result cards show the detail. Never invent addresses, balances, or hashes.`;

function systemFor(walletAddress?: string | null): string {
  if (!walletAddress) return SYSTEM;
  return `${SYSTEM}

The user's connected wallet address is ${walletAddress}. Whenever they say "my", "me", "I", or ask for a balance, tokens, identity, staking, or account overview WITHOUT naming a specific address, use ${walletAddress}. Transfers are always sent FROM ${walletAddress} (the user signs in their own wallet) — only ask for the recipient and amount.`;
}

export async function POST(req: Request) {
  const { messages, walletAddress }: { messages: UIMessage[]; walletAddress?: string | null } =
    await req.json();
  const result = streamText({
    model: resolveModel(),
    system: systemFor(walletAddress),
    messages: await convertToModelMessages(messages),
    tools: buildTools(),
    stopWhen: stepCountIs(5),
  });
  return result.toUIMessageStreamResponse();
}
