"use client";

import { X } from "lucide-react";
import { useWallet } from "@/lib/wallet";
import { truncateAddress } from "@/lib/format";

export function WalletPill() {
  const { account, connect, disconnect, connecting, error } = useWallet();

  if (!account) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={connect}
          disabled={connecting}
          className="rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground transition-[transform,filter] hover:-translate-y-px hover:brightness-110 focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
        >
          {connecting ? "Connecting…" : "Connect Wallet"}
        </button>
        {error && <span className="max-w-[220px] text-right text-xs text-destructive">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm">
      <span className="size-2 rounded-full bg-success shadow-[0_0_8px_var(--success)]" aria-hidden />
      <span className="font-mono text-foreground">{truncateAddress(account.address)}</span>
      <button
        type="button"
        onClick={disconnect}
        aria-label="Disconnect wallet"
        className="text-fg-muted transition-colors hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
