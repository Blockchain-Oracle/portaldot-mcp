"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

/*
  @polkadot/react-identicon ships with a couple of fragile assumptions about
  the runtime (window, dynamic icon-theme lookup, etc.). Loading it via
  next/dynamic with ssr:false keeps it out of the server bundle and avoids
  hydration mismatches when the wallet flips from null → connected.
*/
const PolkadotIdenticon = dynamic(
  () => import("@polkadot/react-identicon").then((m) => m.default ?? m),
  { ssr: false, loading: () => null },
);

export interface IdenticonProps {
  /** ss58-encoded Substrate address. Empty string renders a blank halo. */
  address: string;
  size?: number;
  /** Render a violet halo behind the dots — used as the brand glow in WalletPill. */
  halo?: boolean;
  /** Optional label shown to screen readers. */
  ariaLabel?: string;
  className?: string;
}

export function Identicon({
  address,
  size = 24,
  halo,
  ariaLabel,
  className,
}: IdenticonProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full",
        halo && "shadow-[0_0_0_1px_var(--border-strong),0_0_20px_oklch(0.66_0.22_288_/_45%)]",
        className,
      )}
      style={{ width: size, height: size }}
      aria-label={ariaLabel ?? `identicon for ${address || "no account"}`}
    >
      {address ? (
        <PolkadotIdenticon value={address} size={size} theme="polkadot" />
      ) : (
        <span
          aria-hidden
          className="size-full rounded-full bg-secondary"
          style={{ width: size, height: size }}
        />
      )}
    </span>
  );
}
