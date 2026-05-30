"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUp, Sparkles, Wallet, ShieldCheck } from "lucide-react";
import { useWallet } from "@/lib/wallet";
import { signAndSendTransfer } from "@/lib/polkadot";
import { WalletPill } from "@/components/WalletPill";
import { AppSidebar } from "@/components/app/app-sidebar";
import { Markdown } from "@/components/app/markdown";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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
} from "@/components/tools";

const EXAMPLES = [
  "Give me a full overview of my account",
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

export function ChatApp() {
  const { account, connect, connecting, error: walletError } = useWallet();
  // Keep the latest connected address available to the transport without
  // recreating it — every chat request carries the user's wallet address.
  const addressRef = useRef<string | null>(account?.address ?? null);
  addressRef.current = account?.address ?? null;
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages, body }) => ({
          body: { ...body, messages, walletAddress: addressRef.current },
        }),
      }),
    [],
  );
  const { messages, setMessages, sendMessage, addToolOutput, status } = useChat({
    transport,
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
    if (!t || !account) return;
    setInput("");
    void sendMessage({ text: t });
  };

  // Consume `?prompt=` from the hero AI input — fire once, after the wallet
  // is connected. Survives reload by clearing the URL via router.replace.
  const router = useRouter();
  const searchParams = useSearchParams();
  const consumedPrompt = useRef(false);
  useEffect(() => {
    if (consumedPrompt.current) return;
    if (!account) return;
    const incoming = searchParams.get("prompt");
    if (!incoming) return;
    consumedPrompt.current = true;
    send(incoming);
    // Strip ?prompt= so reload doesn't refire
    router.replace("/app", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, searchParams]);

  function newChat() {
    setMessages([]);
    setInput("");
    setSigning({});
    setTxError({});
  }

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

  const empty = messages.length === 0;

  return (
    <SidebarProvider className="h-dvh">
      <AppSidebar onNewChat={newChat} onPrompt={send} disabled={!account || status !== "ready"} />
      <SidebarInset className="flex min-h-0 flex-col bg-background">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-2 border-b border-border bg-background/80 px-3 backdrop-blur">
          <div className="flex items-center gap-2 text-sm">
            <SidebarTrigger className="text-muted-foreground" />
            <span className="h-4 w-px bg-border" />
            <span className="font-medium text-foreground">Chat</span>
            <span className="rounded-full border border-border bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
              34 tools
            </span>
          </div>
          <WalletPill />
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
            {!account ? (
              <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Wallet className="size-6" />
                </div>
                <div className="max-w-md">
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    Connect your wallet to start
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Portaldot reads your balances and signs transfers from <span className="text-foreground">your</span>{" "}
                    connected account. Connect a Polkadot wallet (SubWallet or Talisman) to begin.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={connect}
                  disabled={connecting}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-[transform,filter] hover:-translate-y-px hover:brightness-110 focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
                >
                  <Wallet className="size-4" />
                  {connecting ? "Connecting…" : "Connect Wallet"}
                </button>
                {walletError && <p className="max-w-xs text-xs text-destructive">{walletError}</p>}
                <p className="inline-flex items-center gap-1.5 text-xs text-fg-muted">
                  <ShieldCheck className="size-3.5 text-primary" /> Keys never leave your device.
                </p>
              </div>
            ) : empty ? (
              <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Sparkles className="size-6" />
                </div>
                <div className="max-w-md">
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    The first AI gateway for Portaldot
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Ask in plain language — read chain state, sign transfers with your wallet. Pick a capability
                    from the left, or try one of these:
                  </p>
                </div>
                <div className="grid w-full max-w-md gap-2">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => send(ex)}
                      className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3.5 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:border-border-hover hover:text-foreground"
                    >
                      <span className="line-clamp-1">{ex}</span>
                      <ArrowUp className="size-3.5 shrink-0 rotate-45 text-fg-muted transition-colors group-hover:text-primary" />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {messages.map((m) => (
              <div key={m.id} className="space-y-2">
                {m.parts.map((part, i) => {
                  if (part.type === "text") {
                    if (m.role === "user") {
                      return (
                        <div
                          key={i}
                          className="ml-auto w-fit max-w-[85%] rounded-2xl bg-secondary px-3.5 py-2 text-sm text-foreground"
                        >
                          {part.text}
                        </div>
                      );
                    }
                    return <Markdown key={i}>{part.text}</Markdown>;
                  }

                  if (typeof part.type === "string" && part.type.startsWith("tool-")) {
                    const tp = part as ToolPart;

                    if (tp.type === "tool-portaldot_transfer") {
                      const raw = (tp.input ?? {}) as Partial<TransferInput>;
                      // Tool args stream in — don't render the preview until the recipient exists.
                      if (!raw.to || !raw.amount) {
                        return <SkeletonCard key={tp.toolCallId} label="Transfer" />;
                      }
                      const inp: TransferInput = { to: raw.to, amount: raw.amount };
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
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="border-t border-border bg-background/80 px-4 py-3 backdrop-blur"
        >
          <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-xl border border-border bg-card px-2 py-1.5 transition-colors focus-within:border-border-hover">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!account}
              placeholder={account ? "Ask Portaldot…" : "Connect your wallet to chat"}
              className="flex-1 bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-fg-muted disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!account || status !== "ready" || !input.trim()}
              aria-label="Send"
              className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-[transform,filter] hover:-translate-y-px hover:brightness-110 focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-40 disabled:hover:translate-y-0"
            >
              <ArrowUp className="size-4" />
            </button>
          </div>
        </form>
      </SidebarInset>
    </SidebarProvider>
  );
}
