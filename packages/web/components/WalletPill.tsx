"use client";

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
          className="rounded-full bg-accent px-3.5 py-1.5 text-sm font-medium text-white transition-[transform,filter] hover:-translate-y-px hover:brightness-110 focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50"
        >
          {connecting ? "Connecting…" : "Connect Wallet"}
        </button>
        {error && <span className="max-w-[220px] text-right text-xs text-destructive">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm">
      <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
      <span className="font-mono text-fg">{truncateAddress(account.address)}</span>
      <button
        type="button"
        onClick={disconnect}
        aria-label="Disconnect wallet"
        className="text-fg-muted transition-colors hover:text-fg"
      >
        ✕
      </button>
    </div>
  );
}
