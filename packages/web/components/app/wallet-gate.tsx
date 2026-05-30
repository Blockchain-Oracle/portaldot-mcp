"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Wallet } from "lucide-react";
import { useWallet } from "@/lib/wallet";
import { BlockHeightTicker } from "@/components/landing/block-height-ticker";

/*
  Wallet gate is the *one* place a glass surface appears in the entire app.
  Everything else is the printed-receipt aesthetic; here we lean into the
  identity-card metaphor — a single floating credential the user inserts.
*/
export function WalletGate() {
  const { openPicker, connecting } = useWallet();

  return (
    <div className="flex min-h-[68vh] flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        {/* violet glow underneath the card */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 translate-y-6 scale-95 rounded-[28px] blur-3xl"
          style={{ background: "radial-gradient(closest-side, oklch(0.66 0.22 288 / 32%), transparent 70%)" }}
        />

        <div className="overflow-hidden rounded-[26px] border border-border-strong/70 bg-card/65 p-1 ring-1 ring-white/5 backdrop-blur-xl shadow-[0_36px_80px_-30px_oklch(0_0_0_/_70%)]">
          <div className="rounded-[22px] border border-border bg-card/40 px-7 py-8 backdrop-blur-2xl">
            {/* meta strip — identity card top */}
            <div className="mb-7 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.22em] text-fg-muted">
              <span className="inline-flex items-center gap-2">
                <span aria-hidden className="size-1.5 rounded-full bg-telemetry glow-telemetry" />
                PORTALDOT · IDENTITY CARD
              </span>
              <BlockHeightTickerInline />
            </div>

            {/* greyscale geometry placeholder — sits where the identicon will materialize */}
            <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full border border-border-strong/60 bg-surface-2/60">
              <svg viewBox="0 0 96 96" width="64" height="64" aria-hidden>
                <defs>
                  <linearGradient id="gateGeom" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="oklch(0.345 0.018 282)" />
                    <stop offset="1" stopColor="oklch(0.52 0.012 282)" />
                  </linearGradient>
                </defs>
                <motion.g
                  style={{ originX: "48px", originY: "48px" }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 28, ease: "linear", repeat: Infinity }}
                >
                  <polygon points="48,12 78,30 78,66 48,84 18,66 18,30" fill="url(#gateGeom)" opacity="0.55" />
                  <polygon
                    points="48,24 70,36 70,60 48,72 26,60 26,36"
                    stroke="oklch(0.66 0.22 288 / 60%)"
                    strokeWidth="1.2"
                    fill="none"
                  />
                </motion.g>
              </svg>
            </div>

            <h1 className="text-center text-[28px] font-medium leading-tight tracking-tight text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              Insert your <em className="font-normal italic text-telemetry">credentials</em>.
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-center text-sm text-fg-secondary">
              Portaldot reads chain state and signs from <span className="text-foreground">your</span> connected account.
              SubWallet or Talisman — either works.
            </p>

            <div className="mt-7 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={openPicker}
                disabled={connecting}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_18px_60px_-12px_oklch(0.66_0.22_288_/_70%)] transition-[transform,filter] hover:-translate-y-px hover:brightness-110 focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
              >
                <Wallet className="size-4" />
                {connecting ? "Connecting…" : "Connect wallet"}
              </button>
              <p className="inline-flex items-center gap-1.5 text-xs text-fg-muted">
                <ShieldCheck className="size-3.5 text-primary" /> Keys never leave your device.
              </p>
            </div>

            <div className="perforation mt-7" />
            <div className="mt-3 flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-fg-muted">
              <span>34 TOOLS · 11 CARD TYPES</span>
              <span>SS58:42 · 14 DECIMALS</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/** Ticker rendered in the meta-strip — same component, smaller footprint. */
function BlockHeightTickerInline() {
  return (
    <div className="scale-[0.85] origin-right">
      <BlockHeightTicker />
    </div>
  );
}
