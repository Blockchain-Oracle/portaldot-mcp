"use client";

import Link from "next/link";
import { useChainPulse } from "@/lib/chain-pulse";

interface FooterLink {
  title: string;
  href: string;
  external?: boolean;
}

const NAV: FooterLink[] = [
  { title: "Docs", href: "/docs" },
  { title: "Tools", href: "/docs/tools" },
  { title: "App", href: "/app" },
  { title: "GitHub", href: "https://github.com/Blockchain-Oracle/portaldot-mcp", external: true },
];

function DiamondMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 2 22 12 12 22 2 12 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 7 17 12 12 17 7 12 12 7Z" fill="currentColor" />
    </svg>
  );
}

function GithubGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 .5C5.7.5.6 5.6.6 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.7 1.2 3.3.9.1-.7.4-1.2.7-1.5-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.4 5.6 18.3.5 12 .5Z" />
    </svg>
  );
}

/*
  Footer = a single telemetry strip. Three rows:
    1. logo · tagline · social
    2. perforation
    3. live mainnet · block · latency · version  +  4 small links
  This replaces the 3-column bento footer with something that reads like
  the chain itself signed off on the page.
*/
export function Footer() {
  const pulse = useChainPulse();

  return (
    <footer className="relative mx-auto w-full max-w-6xl px-4 pb-10 pt-16">
      <div className="overflow-hidden rounded-3xl bg-card/60 p-1 ring-1 ring-border-strong/60 backdrop-blur">
        <div className="rounded-[calc(var(--radius)*1.5)] border border-border bg-card receipt-watermark">
          {/* Row 1 — brand */}
          <div className="flex flex-col items-start justify-between gap-4 px-5 py-4 sm:flex-row sm:items-center">
            <Link href="/" className="inline-flex items-center gap-2 text-foreground">
              <DiamondMark className="size-5 text-primary" />
              <span className="font-semibold tracking-tight">portaldot-mcp</span>
              <span className="ml-2 hidden font-mono text-[11px] text-fg-muted sm:inline">
                · the first MCP server for Portaldot
              </span>
            </Link>
            <a
              href="https://github.com/Blockchain-Oracle/portaldot-mcp"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted transition-colors hover:border-border-strong hover:text-foreground"
            >
              <GithubGlyph className="size-3.5" />
              GitHub
            </a>
          </div>

          <div className="perforation" />

          {/* Row 2 — telemetry + links */}
          <div className="flex flex-col gap-3 px-5 py-3 text-[10px] font-mono uppercase tracking-[0.22em] text-fg-muted sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="size-1.5 rounded-full bg-telemetry glow-telemetry animate-[pulse-soft_2.4s_ease-in-out_infinite]"
                />
                MAINNET
              </span>
              <span>·</span>
              <span className="tabular-nums text-fg-secondary">
                BLOCK {pulse.height !== null ? `#${pulse.height.toLocaleString()}` : "—"}
              </span>
              <span>·</span>
              <span className="tabular-nums">
                LATENCY {pulse.latencyMs !== null ? `${pulse.latencyMs}ms` : "—"}
              </span>
              <span>·</span>
              <span>MIT · {new Date().getFullYear()}</span>
            </div>
            <nav className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {NAV.map((link) =>
                link.external ? (
                  <a
                    key={link.title}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors hover:text-foreground"
                  >
                    {link.title}
                  </a>
                ) : (
                  <Link key={link.title} href={link.href} className="transition-colors hover:text-foreground">
                    {link.title}
                  </Link>
                ),
              )}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
