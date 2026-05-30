"use client";

import * as React from "react";
import { Copy, ExternalLink, LogOut, Check, MoreVertical } from "lucide-react";
import { useWallet } from "@/lib/wallet";
import { truncateAddress } from "@/lib/format";
import { Identicon } from "@/components/cards/identicon";
import { cn } from "@/lib/utils";

const SUBSCAN = "https://portaldot.subscan.io/account/";

export function WalletPill() {
  const { account, connect, disconnect, connecting, error } = useWallet();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  if (!account) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={connect}
          disabled={connecting}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-[0_10px_40px_-12px_oklch(0.66_0.22_288_/_70%)] transition-[transform,filter] hover:-translate-y-px hover:brightness-110 focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
        >
          {connecting ? "Connecting…" : "Connect wallet"}
        </button>
        {error && <span className="max-w-[220px] text-right text-xs text-destructive">{error}</span>}
      </div>
    );
  }

  async function copyAddress() {
    if (!account) return;
    await navigator.clipboard.writeText(account.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="relative" ref={menuRef}>
      <div
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={cn(
          "group flex h-9 items-center gap-2 rounded-full border border-border bg-card/80 pl-1 pr-1 text-sm backdrop-blur transition-[box-shadow,border-color,padding] duration-300",
          "hover:border-border-strong hover:shadow-[0_0_0_1px_var(--border-strong),0_0_24px_oklch(0.66_0.22_288_/_35%)]",
          expanded && "pr-2",
        )}
      >
        <Identicon address={account.address} size={26} halo />
        <span
          className={cn(
            "font-mono text-foreground tabular-nums transition-[max-width,opacity] duration-300",
            expanded ? "max-w-[420px]" : "max-w-[120px]",
          )}
          title={account.address}
        >
          {expanded
            ? account.address
            : truncateAddress(account.address)}
        </span>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Wallet menu"
          className="flex size-7 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-secondary hover:text-foreground"
        >
          <MoreVertical className="size-3.5" />
        </button>
      </div>

      {menuOpen && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-40 w-56 overflow-hidden rounded-xl border border-border-strong bg-card/95 shadow-[0_20px_60px_-20px_oklch(0_0_0_/_70%)] backdrop-blur">
          <button
            type="button"
            onClick={copyAddress}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-fg-secondary transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            {copied ? (
              <Check className="size-3.5 text-success" />
            ) : (
              <Copy className="size-3.5" />
            )}
            <span>{copied ? "Copied" : "Copy address"}</span>
          </button>
          <a
            href={`${SUBSCAN}${account.address}`}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-fg-secondary transition-colors hover:bg-surface-2 hover:text-foreground"
            onClick={() => setMenuOpen(false)}
          >
            <ExternalLink className="size-3.5" />
            <span>View on Subscan</span>
          </a>
          <div className="border-t border-border" />
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              disconnect();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="size-3.5" />
            <span>Disconnect</span>
          </button>
        </div>
      )}
    </div>
  );
}
