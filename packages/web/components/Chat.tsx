"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { useEffect, useRef, useState } from "react";
import { useWallet } from "@/lib/wallet";
import { signAndSendTransfer } from "@/lib/polkadot";
import { WalletPill } from "./WalletPill";
import {
  BalanceCard,
  BlockInfoCard,
  ErrorCard,
  FeeCard,
  GenericResultCard,
  SkeletonCard,
  TaskListCard,
  TokenCard,
  TokenListCard,
  TransferCard,
  type TransferInput,
  type TransferOutput,
} from "./tools";

const EXAMPLES = [
  "Give me a full overview of 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  "What's the Portaldot network status right now?",
  "Who are the active validators?",
  "Send 1 POT to 5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
];

const READ_LABELS: Record<string, string> = {
  "tool-portaldot_get_balance": "Balance",
  "tool-portaldot_get_block_info": "Block",
  "tool-portaldot_estimate_fee": "Estimated fee",
  "tool-portaldot_list_tasks": "Tasks",
  "tool-portaldot_get_task": "Task",
  "tool-portaldot_token_info": "Token",
  "tool-portaldot_my_tokens": "Tokens",
  "tool-portaldot_account_overview": "Account overview",
  "tool-portaldot_chain_info": "Network",
  "tool-portaldot_validators": "Validators",
  "tool-portaldot_staking_info": "Staking",
  "tool-portaldot_resolve_address": "Identity",
  "tool-portaldot_list_proxies": "Proxies",
  "tool-portaldot_list_bounties": "Bounties",
  "tool-portaldot_validate_address": "Address check",
  "tool-portaldot_convert_address": "Address",
};

type ToolPart = {
  type: string;
  toolCallId: string;
  state: "input-streaming" | "input-available" | "output-available" | "output-error";
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

function hasError(output: unknown): output is { error: string } {
  return Boolean(output && typeof output === "object" && "error" in output);
}

export function Chat() {
  const { account } = useWallet();
  const { messages, sendMessage, addToolOutput, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });
  const [input, setInput] = useState("");
  const [signing, setSigning] = useState<Record<string, boolean>>({});
  const [txError, setTxError] = useState<Record<string, string>>({});
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setInput("");
    void sendMessage({ text: t });
  };

  async function onSignTransfer(toolCallId: string, inp: TransferInput) {
    if (!account) return;
    setSigning((s) => ({ ...s, [toolCallId]: true }));
    setTxError((e) => ({ ...e, [toolCallId]: "" }));
    try {
      const result = await signAndSendTransfer(account.address, inp.to, inp.amount);
      addToolOutput({ tool: "portaldot_transfer", toolCallId, output: result });
    } catch (e) {
      setTxError((er) => ({ ...er, [toolCallId]: String(e instanceof Error ? e.message : e) }));
    } finally {
      setSigning((s) => ({ ...s, [toolCallId]: false }));
    }
  }

  function onCancelTransfer(toolCallId: string) {
    addToolOutput({ tool: "portaldot_transfer", toolCallId, output: { cancelled: true } });
  }

  return (
    <div className="mx-auto flex h-dvh max-w-3xl flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-bg/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="text-accent" aria-hidden>◆</span>
          <span className="font-semibold">portaldot-mcp</span>
        </div>
        <WalletPill />
      </header>

      <main className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
            <div>
              <h1 className="text-2xl font-semibold">The first AI gateway for Portaldot</h1>
              <p className="mt-1 text-sm text-fg-secondary">
                Ask in plain language — read chain state, sign transfers with your wallet.
              </p>
            </div>
            <div className="grid w-full max-w-md gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => send(ex)}
                  className="rounded-card border border-border bg-surface px-3 py-2 text-left text-sm text-fg-secondary transition-colors hover:border-border-hover hover:text-fg"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className="space-y-2">
            {m.parts.map((part, i) => {
              if (part.type === "text") {
                return (
                  <div
                    key={i}
                    className={
                      m.role === "user"
                        ? "ml-auto w-fit max-w-[85%] rounded-card bg-surface-2 px-3 py-2 text-sm"
                        : "text-sm leading-relaxed text-fg"
                    }
                  >
                    {part.text}
                  </div>
                );
              }

              if (typeof part.type === "string" && part.type.startsWith("tool-")) {
                const tp = part as ToolPart;

                if (tp.type === "tool-portaldot_transfer") {
                  const inp = (tp.input ?? {}) as TransferInput;
                  const out =
                    tp.state === "output-available" && !hasError(tp.output)
                      ? (tp.output as TransferOutput)
                      : undefined;
                  if (out?.txHash === undefined && hasError(tp.output)) {
                    return <ErrorCard key={tp.toolCallId} message={tp.output.error} />;
                  }
                  return (
                    <TransferCard
                      key={tp.toolCallId}
                      input={inp}
                      output={out}
                      signing={signing[tp.toolCallId]}
                      error={txError[tp.toolCallId]}
                      canSign={Boolean(account)}
                      onSign={() => onSignTransfer(tp.toolCallId, inp)}
                      onCancel={() => onCancelTransfer(tp.toolCallId)}
                    />
                  );
                }

                const label = READ_LABELS[tp.type] ?? "Tool";
                if (tp.state !== "output-available") {
                  return <SkeletonCard key={tp.toolCallId} label={label} />;
                }
                if (hasError(tp.output)) {
                  return <ErrorCard key={tp.toolCallId} message={tp.output.error} />;
                }
                const data = tp.output as Record<string, unknown>;
                switch (tp.type) {
                  case "tool-portaldot_get_balance":
                    return <BalanceCard key={tp.toolCallId} data={data} />;
                  case "tool-portaldot_get_block_info":
                    return <BlockInfoCard key={tp.toolCallId} data={data} />;
                  case "tool-portaldot_estimate_fee":
                    return <FeeCard key={tp.toolCallId} data={data} />;
                  case "tool-portaldot_list_tasks":
                    return <TaskListCard key={tp.toolCallId} data={data} />;
                  case "tool-portaldot_get_task":
                    return <TaskListCard key={tp.toolCallId} data={{ tasks: data.task ? [data.task] : [] }} />;
                  case "tool-portaldot_token_info":
                    return <TokenCard key={tp.toolCallId} data={data} />;
                  case "tool-portaldot_my_tokens":
                    return <TokenListCard key={tp.toolCallId} data={data} />;
                  default:
                    return <GenericResultCard key={tp.toolCallId} label={label} data={data} />;
                }
              }
              return null;
            })}
          </div>
        ))}
        <div ref={endRef} />
      </main>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="sticky bottom-0 border-t border-border bg-bg px-4 py-3"
      >
        <div className="flex items-center gap-2 rounded-card border border-border bg-surface-2 px-3 py-2 focus-within:border-border-hover">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Portaldot…"
            className="flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-muted"
          />
          <button
            type="submit"
            disabled={status !== "ready" || !input.trim()}
            className="rounded-lg bg-accent px-3 py-1 text-sm font-medium text-white transition-[transform,filter] hover:-translate-y-px hover:brightness-110 focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-40"
          >
            →
          </button>
        </div>
      </form>
    </div>
  );
}
