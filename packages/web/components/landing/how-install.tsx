"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { InstallCommand } from "@/components/install-command";
import { SectionHeading } from "@/components/landing/features";
import { cn } from "@/lib/utils";

/*
  HowItWorks — three boarding-pass receipts. Each pass has the large step
  number in the "stub" segment on the left, perforation, then title +
  body in the "ticket" segment on the right. Tones progress from telemetry
  cyan (live signal in) to success (signed proof out), reinforcing the
  user's journey from prompt → signature.
*/

const steps = [
  {
    num: "01",
    title: "Connect your wallet",
    body: "SubWallet, Talisman, Polkadot{.js}, or Nova — pick from the modal. Signing happens locally; the server never sees a seed.",
    tone: "default" as const,
  },
  {
    num: "02",
    title: "Ask in plain language",
    body: "“What's the latest block?”, “Who are the validators?”, “Send 1 POT to 5Grw…”. The model picks the right tool; the chain returns a receipt.",
    tone: "default" as const,
  },
  {
    num: "03",
    title: "Sign & confirm",
    body: "Review the generated card, approve in your wallet, and watch the transfer finalize — a PAID stamp lands on the receipt the moment the block does.",
    tone: "success" as const,
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative border-t border-border px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="HOW IT WORKS"
          title={<>From prompt to <em className="font-normal italic text-telemetry">signed</em> transaction.</>}
          subtitle="Three steps. No SDK wiring, no raw extrinsics."
        />
        <div className="mt-12 grid gap-3 sm:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <BoardingPass num={s.num} title={s.title} body={s.body} tone={s.tone} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BoardingPass({
  num,
  title,
  body,
  tone,
}: {
  num: string;
  title: string;
  body: string;
  tone: "default" | "success";
}) {
  const dotBg =
    tone === "success"
      ? "bg-success shadow-[0_0_8px_var(--success)]"
      : "bg-telemetry shadow-[0_0_8px_var(--telemetry)]";

  return (
    <article
      className={cn(
        "group relative h-full overflow-hidden rounded-2xl bg-card p-1 ring-1 transition-shadow",
        tone === "success" ? "ring-success/40" : "ring-border-strong/60",
        "hover:shadow-[0_24px_60px_-30px_oklch(0_0_0_/_70%)]",
      )}
    >
      <div className="relative h-full overflow-hidden rounded-[calc(var(--radius)*1.5)] border border-border bg-card receipt-watermark">
        {/* meta strip */}
        <div className="flex items-center justify-between gap-3 px-4 py-2 text-[10px] font-mono uppercase tracking-[0.18em] text-fg-muted">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className={cn("size-1.5 rounded-full", dotBg)} />
            BOARDING · STEP {num}
          </span>
          <span>{tone === "success" ? "ISSUED" : "PENDING"}</span>
        </div>
        <div className="perforation" />

        {/* number stub */}
        <div className="grid grid-cols-[auto_1fr] gap-4 px-4 py-4">
          <div className="flex flex-col items-center justify-center border-r border-dashed border-border-strong/60 pr-4">
            <div
              className="text-[58px] leading-none tracking-tight text-foreground"
              style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
            >
              {num}
            </div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-fg-muted">
              STEP
            </div>
          </div>
          <div className="min-w-0">
            <h3
              className="text-[16px] leading-tight tracking-tight text-foreground"
              style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
            >
              {title}
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-fg-secondary">{body}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function Install() {
  return (
    <section id="install" className="relative border-t border-border px-4 py-20 sm:py-28">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <SectionHeading
          eyebrow="INSTALL"
          title={<>One line into <em className="font-normal italic text-telemetry">any</em> MCP client.</>}
          subtitle="Claude Code, Cursor, Claude Desktop or the console. Or skip the client entirely and open the web app."
        />
        <div className="space-y-4">
          <InstallCommand />
          <Link
            href="/docs"
            className="group inline-flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-[0.18em] text-telemetry transition-colors hover:text-foreground"
          >
            Read the docs · all 34 tools
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
