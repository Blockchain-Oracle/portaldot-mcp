"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Wallet, MessageSquareText, CircleCheck, ArrowRight } from "lucide-react";
import { CodeBlock, CodeBlockCode } from "@/components/ui/code-block";
import { InstallCommand } from "@/components/install-command";
import { SectionHeading } from "@/components/landing/features";

const steps = [
  {
    icon: Wallet,
    title: "Connect your wallet",
    body: "SubWallet or Talisman, in the browser. Signing is local — the server never sees a seed.",
  },
  {
    icon: MessageSquareText,
    title: "Ask in plain language",
    body: "“What's the latest block?”, “Who are the validators?”, “Send 1 POT to 5Grw…”.",
  },
  {
    icon: CircleCheck,
    title: "Sign & confirm",
    body: "Review the generated card, approve in your wallet, and watch the transfer finalize on-chain.",
  },
];

const envCode = `# web chat — set ANY one provider, it's auto-detected
ANTHROPIC_API_KEY=sk-ant-...
# or OPENAI_API_KEY / XAI_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY
PORTALDOT_RPC_URL=wss://mainnet.portaldot.io`;

export function HowItWorks() {
  return (
    <section id="how" className="border-t border-border px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="How it works"
          title="From prompt to signed transaction."
          subtitle="Three steps. No SDK wiring, no raw extrinsics."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/12 text-primary">
                  <s.icon className="size-[18px]" />
                </div>
                <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
              </div>
              <h3 className="mt-4 font-medium tracking-tight text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Install() {
  return (
    <section id="install" className="border-t border-border px-4 py-20 sm:py-28">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <SectionHeading
          eyebrow="Install"
          title="One line into any MCP client."
          subtitle="Claude Code, Cursor, Claude Desktop or the console. Or skip the client entirely and open the web app."
        />
        <div className="space-y-4">
          <InstallCommand />
          <CodeBlock className="bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <span className="font-mono text-xs text-muted-foreground">.env</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary">web</span>
            </div>
            <CodeBlockCode code={envCode} language="bash" theme="github-dark" />
          </CodeBlock>
          <Link
            href="/docs"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-opacity hover:opacity-80"
          >
            Read the docs — all 34 tools
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
