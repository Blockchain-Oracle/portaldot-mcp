"use client";

import { motion } from "framer-motion";
import {
  Boxes,
  Wallet,
  LayoutDashboard,
  Activity,
  BrainCircuit,
  FileCode2,
  type LucideIcon,
} from "lucide-react";
import { GlowCard } from "@/components/ui/spotlight-card";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  meta?: string;
}

const features: Feature[] = [
  {
    icon: Boxes,
    title: "34 onchain tools",
    description:
      "Balances, blocks, fees, validators, staking, identity, tokens, proxies, bounties, transfers and batch sends — one tool per capability, every one schema-typed.",
    meta: "base + tier 1–4",
    className: "md:col-span-2",
  },
  {
    icon: Wallet,
    title: "Your keys, your signature",
    description:
      "Writes are signed in the browser with @polkadot/extension-dapp. The server proposes; your wallet approves. Seeds never touch a backend.",
  },
  {
    icon: LayoutDashboard,
    title: "Generative UI cards",
    description:
      "Every tool result streams into a typed React card — balances, blocks, tokens, a sign-and-send transfer flow — not a wall of JSON.",
  },
  {
    icon: Activity,
    title: "Real chain, no mocks",
    description:
      "Every read hits Portaldot over @polkadot/api. No Math.random() placeholders — real state or a loud failure.",
  },
  {
    icon: BrainCircuit,
    title: "Bring any model",
    description: "Anthropic, OpenAI, xAI and Google — swap the LLM with one env var.",
  },
  {
    icon: FileCode2,
    title: "ink! Task Ledger",
    description: "A real ink! v5 contract toolkit — create and read onchain tasks, POT-gas deploy gate included.",
    className: "md:col-span-2",
  },
];

export function Features() {
  return (
    <section id="features" className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="What it does"
          title="One MCP server. The whole chain."
          subtitle="Read state, mint tokens, sign transfers — described in plain language, executed against the real Portaldot runtime."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className={f.className}
            >
              <GlowCard
                glowColor="purple"
                customSize
                className="h-full min-h-[188px] w-full !rounded-2xl border-border bg-card"
              >
                <div className="flex h-full flex-col">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/12 text-primary">
                    <f.icon className="size-[18px]" />
                  </div>
                  <h3 className="mt-4 flex items-center gap-2 font-medium tracking-tight text-foreground">
                    {f.title}
                    {f.meta && (
                      <span className="rounded-full border border-border bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {f.meta}
                      </span>
                    )}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl"
    >
      <span className="font-mono text-xs uppercase tracking-widest text-primary">{eyebrow}</span>
      <h2 className="mt-3 font-semibold tracking-[-0.02em] text-foreground text-3xl sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-base text-muted-foreground">{subtitle}</p>}
    </motion.div>
  );
}
