"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Wallet, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WordsPullUp } from "@/components/ui/prisma-hero";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-20 pb-16 sm:pt-28 sm:pb-24">
      {/* violet radial glow — on-brand, not a linear AI gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-12%] -z-10 h-[520px] w-[820px] max-w-[120vw] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--accent-soft), transparent 72%)",
          animation: "glow 6s ease-in-out infinite",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(circle at 50% 30%, black, transparent 75%)",
        }}
      />

      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col items-start">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground"
          >
            <span className="size-1.5 rounded-full bg-primary" />
            MCP server · Portaldot L0
          </motion.span>

          <h1 className="mt-6 font-semibold tracking-[-0.03em] text-foreground text-4xl leading-[1.05] sm:text-5xl md:text-6xl">
            <WordsPullUp text="Portaldot, in" />
            <br className="hidden sm:block" />
            <span className="text-primary">
              <WordsPullUp text="plain language." />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-6 max-w-md text-base text-muted-foreground sm:text-lg"
          >
            The first MCP server for Portaldot. Ask in natural language — read balances,
            blocks, validators and tokens, then sign transfers with your own wallet.
            34 onchain tools, no glue code.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href="/app" className={cn(buttonVariants({ size: "lg" }), "group")}>
              Open the app
              <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="https://github.com/Blockchain-Oracle/portaldot-mcp"
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              View on GitHub
            </a>
          </motion.div>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Wallet className="size-3.5 text-primary" /> Browser-wallet signing
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-primary" /> Keys never leave your device
            </span>
          </div>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full"
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_60px_-24px_rgba(0,0,0,0.7)]">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="size-2.5 rounded-full bg-destructive/70" />
          <span className="size-2.5 rounded-full bg-pending/70" />
          <span className="size-2.5 rounded-full bg-success/70" />
          <span className="ml-2 font-mono text-xs text-muted-foreground">portaldot · chat</span>
        </div>

        <div className="space-y-3 p-4">
          <div className="ml-auto w-fit max-w-[80%] rounded-xl bg-secondary px-3 py-2 text-sm text-foreground">
            What&apos;s the balance of 5F3sA…utQY?
          </div>

          <div className="rounded-xl border border-border bg-background/60 p-4">
            <div className="mb-3 flex items-center gap-2 text-[13px] text-muted-foreground">
              <Wallet className="size-3.5 text-primary" /> Balance
            </div>
            <div className="mb-2 font-mono text-xs text-muted-foreground">5F3sA…utQY</div>
            <div className="flex items-center justify-between py-0.5 text-sm">
              <span className="text-muted-foreground">Free</span>
              <span className="font-mono text-foreground">42.0000 POT</span>
            </div>
            <div className="flex items-center justify-between py-0.5 text-sm">
              <span className="text-muted-foreground">Reserved</span>
              <span className="font-mono text-foreground">0.0000 POT</span>
            </div>
            <div className="my-2 h-px bg-border" />
            <div className="flex items-center justify-between py-0.5 text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-mono font-medium text-foreground">42.0000 POT</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
