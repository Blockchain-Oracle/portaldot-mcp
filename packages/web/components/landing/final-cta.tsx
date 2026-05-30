"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useChainPulse } from "@/lib/chain-pulse";

/*
  Signed-proof receipt — the CTA leans hard into the brand metaphor: the
  card itself is the credential. Perforations top + bottom, italic display
  headline, "VALID SINCE BLOCK #X" mono row at the bottom, signed by
  portaldot-mcp. The block number streams in live from chain-pulse so the
  signature is visibly *real*.
*/
export function FinalCta() {
  const pulse = useChainPulse();

  return (
    <section className="px-4 py-24 sm:py-32">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-3xl"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 translate-y-6 scale-95 rounded-[28px] blur-3xl"
          style={{ background: "radial-gradient(closest-side, oklch(0.66 0.22 288 / 28%), transparent 70%)" }}
        />

        <div className="overflow-hidden rounded-3xl bg-card p-1 ring-1 ring-border-strong/70 shadow-[0_36px_80px_-30px_oklch(0_0_0_/_70%)]">
          <div className="relative rounded-[calc(var(--radius)*1.5)] border border-border bg-card receipt-watermark">
            {/* meta strip — top */}
            <div className="flex items-center justify-between gap-3 px-6 py-3 text-[10px] font-mono uppercase tracking-[0.22em] text-fg-muted">
              <span className="inline-flex items-center gap-2">
                <span aria-hidden className="size-1.5 rounded-full bg-primary glow-primary" />
                PORTALDOT · INVITATION
              </span>
              <span>NON-TRANSFERABLE</span>
            </div>
            <div className="perforation" />

            {/* body */}
            <div className="px-6 py-12 text-center sm:px-12 sm:py-16">
              <h2
                className="text-[40px] leading-tight tracking-tight text-foreground sm:text-[56px]"
                style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
              >
                Talk to <em className="font-normal italic text-telemetry">Portaldot</em>.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-fg-secondary">
                Open the chat, connect a wallet, and run your first on-chain action in plain language.
              </p>
              <div className="mt-8 flex items-center justify-center">
                <Link
                  href="/app"
                  className="group inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_18px_60px_-12px_oklch(0.66_0.22_288_/_70%)] transition-[transform,filter] hover:-translate-y-px hover:brightness-110 focus-visible:outline-2 focus-visible:outline-ring"
                >
                  Open the app
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            <div className="perforation" />
            {/* meta strip — bottom (the signature) */}
            <div className="flex flex-col gap-2 px-6 py-3 text-[10px] font-mono uppercase tracking-[0.22em] text-fg-muted sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-3 text-primary" />
                SIGNED · portaldot-mcp
              </span>
              <span className="tabular-nums">
                VALID SINCE BLOCK{" "}
                <span className="text-foreground">
                  {pulse.height !== null ? `#${pulse.height.toLocaleString()}` : "…"}
                </span>
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
