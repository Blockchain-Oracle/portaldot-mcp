import Link from "next/link";
import { ArrowRight, Wallet, MessageSquareText, TerminalSquare } from "lucide-react";
import { InstallCommand } from "@/components/install-command";
import { CodeBlock, CodeBlockCode } from "@/components/ui/code-block";
import { TOOL_COUNT } from "@/lib/tools-catalog";

export const metadata = {
  title: "Getting started · portaldot-mcp",
};

const envCode = `# Network — defaults to mainnet; override for the local dev node
PORTALDOT_RPC_URL=wss://mainnet.portaldot.io

# Optional: a funded seed enables headless writes (auto-generated if unset)
PORTALDOT_SEED_PHRASE=`;

const steps = [
  { icon: TerminalSquare, title: "Install", body: "Add the server to your MCP client with one command (above). No clone, no build — it runs straight from npm." },
  { icon: Wallet, title: "Connect / fund", body: "Reads work immediately on mainnet. Writes (transfers, mints) sign with your wallet in the web app, or a funded PORTALDOT_SEED_PHRASE on the MCP server." },
  { icon: MessageSquareText, title: "Ask", body: "Talk to the chain in plain language — “What's the latest block?”, “Send 1 POT to 5FHne…”, “Create a task: ship the demo”." },
];

export default function DocsHome() {
  return (
    <div className="max-w-2xl">
      <span className="font-mono text-xs uppercase tracking-widest text-primary">Getting started</span>
      <h1 className="mt-3 font-semibold tracking-[-0.02em] text-foreground text-3xl">
        Install portaldot-mcp
      </h1>
      <p className="mt-3 text-base text-muted-foreground">
        The first MCP server for Portaldot — {TOOL_COUNT} on-chain tools over stdio, for any MCP client. Pick your
        client and copy the command.
      </p>

      <div className="mt-8">
        <InstallCommand />
      </div>

      <div className="mt-12 space-y-4">
        {steps.map((s, i) => (
          <div key={s.title} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
              <s.icon className="size-[18px]" />
            </div>
            <div>
              <h3 className="flex items-center gap-2 font-medium text-foreground">
                <span className="font-mono text-xs text-fg-muted">0{i + 1}</span>
                {s.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-12 font-semibold tracking-tight text-foreground text-xl">Configuration</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Set these as environment variables on the MCP server (or in the web app&apos;s <code className="rounded bg-secondary px-1 py-0.5 font-mono text-xs">.env</code>).
      </p>
      <div className="mt-4">
        <CodeBlock>
          <div className="border-b border-border px-4 py-2 font-mono text-xs text-muted-foreground">.env</div>
          <CodeBlockCode code={envCode} language="bash" theme="github-dark" />
        </CodeBlock>
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5">
        <div className="min-w-0">
          <h3 className="font-medium text-foreground">Browse all {TOOL_COUNT} tools</h3>
          <p className="text-sm text-muted-foreground">Balances, transfers, tokens, staking, contracts and more — each with an example prompt.</p>
        </div>
        <Link
          href="/docs/tools"
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-[transform,filter] hover:-translate-y-px hover:brightness-110"
        >
          Tool catalog
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
