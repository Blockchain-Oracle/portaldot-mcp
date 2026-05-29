"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FinalCta() {
  return (
    <section className="px-4 py-24 sm:py-32">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border bg-card px-6 py-14 text-center sm:px-12"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -z-0 h-64 w-[480px] max-w-[110%] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
          style={{ background: "radial-gradient(closest-side, var(--accent-soft), transparent 70%)" }}
        />
        <div className="relative">
          <h2 className="font-semibold tracking-[-0.02em] text-foreground text-3xl sm:text-4xl">
            Talk to Portaldot.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground">
            Open the chat, connect a wallet, and run your first on-chain action in plain language.
          </p>
          <div className="mt-8 flex items-center justify-center">
            <Link href="/app" className={cn(buttonVariants({ size: "lg" }), "group")}>
              Open the app
              <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
