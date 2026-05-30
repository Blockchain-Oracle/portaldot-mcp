"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Search, ArrowUpRight, Sparkles } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useWallet } from "@/lib/wallet";
import { useChainPulse } from "@/lib/chain-pulse";
import { truncateAddress } from "@/lib/format";
import { Identicon } from "@/components/cards/identicon";
import { cn } from "@/lib/utils";

/*
  The sidebar's *only* job is launching prompts. Don't dress that up with a
  generic icon list — show the prompts themselves. Each card is a starter
  the user can fire as-is: a short title + the full prompt text, filterable
  via a small input at the top.
*/

interface Starter {
  title: string;
  prompt: string;
  group: "you" | "chain";
}

const STARTERS: Starter[] = [
  // "ASK ABOUT YOU"
  { group: "you", title: "Account snapshot", prompt: "Give me a full overview of my account" },
  { group: "you", title: "List my tokens", prompt: "List the tokens I own." },
  { group: "you", title: "Resolve my identity", prompt: "Resolve my on-chain identity" },
  { group: "you", title: "My onchain tasks", prompt: "List my onchain tasks." },
  {
    group: "you",
    title: "Send 1 POT",
    prompt: "Send 1 POT to 5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
  },
  // "ASK THE CHAIN"
  { group: "chain", title: "Network status", prompt: "What's the Portaldot network status right now?" },
  { group: "chain", title: "Latest block", prompt: "Show me the latest Portaldot block." },
  { group: "chain", title: "Active validators", prompt: "Who are the active validators?" },
];

function DiamondMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 2 22 12 12 22 2 12 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 7 17 12 12 17 7 12 12 7Z" fill="currentColor" />
    </svg>
  );
}

function PromptCard({
  starter,
  onPrompt,
  disabled,
}: {
  starter: Starter;
  onPrompt: (text: string) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onPrompt(starter.prompt)}
      disabled={disabled}
      className={cn(
        "group relative w-full overflow-hidden rounded-xl border border-border bg-card/40 px-3 py-2.5 text-left transition-all",
        "hover:-translate-y-px hover:border-border-strong hover:bg-card",
        "focus-visible:outline-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] font-medium text-foreground">{starter.title}</span>
        <ArrowUpRight
          aria-hidden
          className="size-3.5 shrink-0 -translate-x-0.5 translate-y-0.5 text-fg-muted opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-primary group-hover:opacity-100"
        />
      </div>
      <p className="mt-0.5 line-clamp-1 text-[11.5px] leading-snug text-fg-muted group-hover:line-clamp-2 group-hover:text-fg-secondary">
        {starter.prompt}
      </p>
    </button>
  );
}

export function AppSidebar({
  onNewChat,
  onPrompt,
  disabled,
}: {
  onNewChat: () => void;
  onPrompt: (text: string) => void;
  disabled?: boolean;
}) {
  const { account, openPicker } = useWallet();
  const pulse = useChainPulse();
  const [filter, setFilter] = React.useState("");

  const matches = (s: Starter) => {
    if (!filter.trim()) return true;
    const f = filter.toLowerCase();
    return s.title.toLowerCase().includes(f) || s.prompt.toLowerCase().includes(f);
  };
  const you = STARTERS.filter((s) => s.group === "you" && matches(s));
  const chain = STARTERS.filter((s) => s.group === "chain" && matches(s));

  return (
    <Sidebar collapsible="icon" className="border-border">
      <SidebarHeader className="border-b border-border p-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground group-data-[collapsible=icon]:justify-center"
        >
          <DiamondMark className="size-5 shrink-0 text-primary" />
          <span className="font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            portaldot
          </span>
          <span className="ml-auto rounded-full border border-border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-fg-muted group-data-[collapsible=icon]:hidden">
            console
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-3 group-data-[collapsible=icon]:px-1.5">
        {/* New conversation */}
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <button
              type="button"
              onClick={onNewChat}
              className={cn(
                "inline-flex w-full items-center gap-2 rounded-xl bg-primary/12 px-3 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/20 hover:-translate-y-px",
                "focus-visible:outline-2 focus-visible:outline-ring",
                "group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
              )}
              title="New conversation"
            >
              <Plus className="size-4" />
              <span className="group-data-[collapsible=icon]:hidden">New conversation</span>
            </button>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Search */}
        <SidebarGroup className="p-0 group-data-[collapsible=icon]:hidden">
          <SidebarGroupContent>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-fg-muted" />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter prompts…"
                className="w-full rounded-lg border border-border bg-surface-2/40 py-1.5 pl-8 pr-2 text-[12.5px] text-foreground outline-none placeholder:text-fg-muted focus:border-border-strong"
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* You */}
        {you.length > 0 && (
          <SidebarGroup className="p-0 group-data-[collapsible=icon]:hidden">
            <p className="px-1 pb-1.5 pt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-fg-muted">
              Ask about you
            </p>
            <SidebarGroupContent>
              <div className="space-y-1.5">
                {you.map((s) => (
                  <PromptCard key={s.title} starter={s} onPrompt={onPrompt} disabled={disabled} />
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Chain */}
        {chain.length > 0 && (
          <SidebarGroup className="p-0 group-data-[collapsible=icon]:hidden">
            <p className="px-1 pb-1.5 pt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-fg-muted">
              Ask the chain
            </p>
            <SidebarGroupContent>
              <div className="space-y-1.5">
                {chain.map((s) => (
                  <PromptCard key={s.title} starter={s} onPrompt={onPrompt} disabled={disabled} />
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {filter.trim() && you.length + chain.length === 0 && (
          <p className="px-1 pt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted group-data-[collapsible=icon]:hidden">
            —— no match ——
          </p>
        )}

        {/* Collapsed-state anchor: identicon button to open picker */}
        {!account && (
          <button
            type="button"
            onClick={openPicker}
            title="Connect wallet"
            className="hidden size-9 items-center justify-center rounded-xl border border-border bg-surface-2/40 text-fg-muted transition-colors hover:border-border-strong hover:text-foreground group-data-[collapsible=icon]:flex"
          >
            <Sparkles className="size-4" />
          </button>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-3 group-data-[collapsible=icon]:p-1.5">
        {/* Connected: identity + telemetry. Disconnected: telemetry only. */}
        {account ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2/40 px-2 py-1.5 group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center">
              <Identicon address={account.address} size={22} halo />
              <span className="min-w-0 flex-1 font-mono text-[11px] tabular-nums text-fg-secondary group-data-[collapsible=icon]:hidden">
                {truncateAddress(account.address, 5, 5)}
              </span>
            </div>
            <FooterTelemetry height={pulse.height} />
          </div>
        ) : (
          <FooterTelemetry height={pulse.height} />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

function FooterTelemetry({ height }: { height: number | null }) {
  return (
    <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted group-data-[collapsible=icon]:hidden">
      <span className="inline-flex items-center gap-1.5">
        <span
          aria-hidden
          className="size-1.5 rounded-full bg-telemetry glow-telemetry animate-[pulse-soft_2.4s_ease-in-out_infinite]"
        />
        <span>Mainnet</span>
      </span>
      <span className="tabular-nums text-fg-secondary">
        {height !== null ? `#${height.toLocaleString()}` : "—"}
      </span>
    </div>
  );
}
