"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X, ShieldCheck, Loader2 } from "lucide-react";
import { useWallet, type DetectedWallet } from "@/lib/wallet";
import { cn } from "@/lib/utils";

/* Branded SubWallet glyph — three diamonds stepped. Hand-rolled to avoid
   pulling brand assets and to keep the mark-set coherent with the rest of
   the instrument-panel iconography. */
function SubWalletGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="sw" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FA9D34" />
          <stop offset="1" stopColor="#FF4730" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#sw)" />
      <path
        d="M16 8 22 16 16 24 10 16 16 8Z"
        fill="white"
        opacity="0.95"
      />
    </svg>
  );
}

function TalismanGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#FD4848" />
      <path d="M16 8 C20 12 22 16 22 20 C22 22 19 24 16 24 C13 24 10 22 10 20 C10 16 12 12 16 8 Z" fill="white" />
      <circle cx="16" cy="20" r="2" fill="#FD4848" />
    </svg>
  );
}

function PolkadotJsGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#FF8C00" />
      <circle cx="16" cy="10" r="3" fill="white" />
      <circle cx="16" cy="22" r="3" fill="white" />
      <circle cx="10.5" cy="13" r="3" fill="white" />
      <circle cx="21.5" cy="13" r="3" fill="white" />
      <circle cx="10.5" cy="19" r="3" fill="white" />
      <circle cx="21.5" cy="19" r="3" fill="white" />
    </svg>
  );
}

function NovaGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="nv" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2BFEFF" />
          <stop offset="1" stopColor="#9D78FF" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#nv)" />
      <path d="M10 22 L16 10 L22 22 L16 18 Z" fill="white" />
    </svg>
  );
}

const GLYPH: Record<string, React.FC<{ className?: string }>> = {
  "subwallet-js": SubWalletGlyph,
  talisman: TalismanGlyph,
  "polkadot-js": PolkadotJsGlyph,
  nova: NovaGlyph,
};

export function WalletPicker() {
  const { pickerOpen, closePicker, detectWallets, connectWith, connecting, error } = useWallet();
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [wallets, setWallets] = React.useState<DetectedWallet[]>(() => detectWallets());

  // Re-detect whenever the modal opens — extensions inject after page-load.
  React.useEffect(() => {
    if (!pickerOpen) return;
    setWallets(detectWallets());
    const id = setInterval(() => setWallets(detectWallets()), 1200);
    return () => clearInterval(id);
  }, [pickerOpen, detectWallets]);

  React.useEffect(() => {
    if (!pickerOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closePicker();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pickerOpen, closePicker]);

  async function pick(id: string) {
    setPendingId(id);
    try {
      await connectWith(id);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <AnimatePresence>
      {pickerOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[1000] flex items-end justify-center sm:items-center"
          aria-modal
          role="dialog"
        >
          {/* backdrop */}
          <div
            aria-hidden
            className="absolute inset-0 bg-background/70 backdrop-blur-md"
            onClick={closePicker}
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative w-full max-w-[420px] overflow-hidden rounded-t-3xl border border-border-strong/70 bg-card p-1",
              "shadow-[0_40px_100px_-20px_oklch(0_0_0_/_70%)] ring-1 ring-white/5",
              "sm:rounded-3xl",
            )}
          >
            {/* violet glow under the card */}
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 left-1/2 -z-0 size-72 -translate-x-1/2 rounded-full opacity-50 blur-3xl"
              style={{
                background:
                  "radial-gradient(closest-side, oklch(0.66 0.22 288 / 38%), transparent 70%)",
              }}
            />

            <div className="relative rounded-[22px] border border-border bg-card/90 p-5">
              {/* meta strip */}
              <div className="mb-4 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.22em] text-fg-muted">
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden className="size-1.5 rounded-full bg-telemetry glow-telemetry" />
                  PORTALDOT · CONNECT
                </span>
                <button
                  type="button"
                  onClick={closePicker}
                  className="flex size-7 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="size-3.5" />
                </button>
              </div>

              <h2
                className="text-[24px] font-medium leading-tight tracking-tight text-foreground"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Choose a wallet
              </h2>
              <p className="mt-1.5 text-[13px] text-fg-secondary">
                Portaldot signs from your wallet. Pick one — keys stay on your device.
              </p>

              <div className="perforation my-4" />

              <ul className="space-y-2">
                {wallets.map((w) => {
                  const Glyph = GLYPH[w.id];
                  const isPending = pendingId === w.id && connecting;
                  return (
                    <li key={w.id}>
                      {w.installed ? (
                        <button
                          type="button"
                          disabled={connecting}
                          onClick={() => pick(w.id)}
                          className={cn(
                            "group flex w-full items-center gap-3 rounded-2xl border border-border bg-surface-2/60 p-3 text-left transition-all",
                            "hover:-translate-y-px hover:border-border-strong hover:bg-surface-2 hover:shadow-[0_10px_30px_-12px_oklch(0.66_0.22_288_/_45%)]",
                            "focus-visible:outline-2 focus-visible:outline-ring",
                            "disabled:cursor-not-allowed disabled:opacity-60",
                          )}
                        >
                          {Glyph && <Glyph className="size-9 shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[14px] font-medium text-foreground">{w.name}</span>
                              {w.tag && (
                                <span className="rounded-full border border-telemetry/40 px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.16em] text-telemetry">
                                  {w.tag}
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-success">
                              <span aria-hidden className="size-1 rounded-full bg-success" />
                              detected
                            </div>
                          </div>
                          {isPending ? (
                            <Loader2 className="size-4 animate-spin text-primary" />
                          ) : (
                            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary opacity-0 transition-opacity group-hover:opacity-100">
                              connect
                            </span>
                          )}
                        </button>
                      ) : (
                        <a
                          href={w.install}
                          target="_blank"
                          rel="noreferrer"
                          className={cn(
                            "group flex w-full items-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 p-3 transition-all",
                            "hover:-translate-y-px hover:border-border-strong hover:bg-surface-2/40",
                          )}
                        >
                          {Glyph && <Glyph className="size-9 shrink-0 opacity-60 transition-opacity group-hover:opacity-100" />}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[14px] font-medium text-fg-secondary">{w.name}</span>
                              {w.tag && (
                                <span className="rounded-full border border-border px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.16em] text-fg-muted">
                                  {w.tag}
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
                              <span aria-hidden className="size-1 rounded-full bg-fg-muted/60" />
                              not installed
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.18em] text-telemetry">
                            install
                            <ExternalLink className="size-3" />
                          </span>
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>

              {error && (
                <p className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
                  {error}
                </p>
              )}

              <div className="perforation my-4" />

              <div className="flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-fg-muted">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-3 text-primary" />
                  Non-custodial · keys stay local
                </span>
                <span>SS58:42 · 14 dec</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
