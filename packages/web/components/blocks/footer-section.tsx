"use client";
import React from "react";
import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

interface FooterLink {
  title: string;
  href: string;
  external?: boolean;
}

interface FooterColumn {
  label: string;
  links: FooterLink[];
}

const footerColumns: FooterColumn[] = [
  {
    label: "Product",
    links: [
      { title: "Features", href: "/#features" },
      { title: "How it works", href: "/#how" },
      { title: "Open the app", href: "/app" },
    ],
  },
  {
    label: "Developers",
    links: [
      { title: "MCP server", href: "/#install" },
      { title: "Tool catalog", href: "/#features" },
      { title: "GitHub", href: "https://github.com/Blockchain-Oracle/portaldot-mcp", external: true },
    ],
  },
  {
    label: "Network",
    links: [
      { title: "Portaldot mainnet", href: "/#how" },
      { title: "Token: POT", href: "/#how" },
      { title: "ss58 · 14 decimals", href: "/#how" },
    ],
  },
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

function XGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="relative mx-auto flex w-full max-w-6xl flex-col rounded-t-[2.5rem] border-t border-border bg-[radial-gradient(40%_128px_at_50%_0%,var(--accent-soft),transparent)] px-6 py-14 lg:py-20">
      <div className="absolute top-0 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/40 blur-sm" />

      <div className="grid w-full gap-12 xl:grid-cols-3 xl:gap-8">
        <AnimatedContainer className="space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 text-foreground">
            <DiamondMark className="size-6 text-primary" />
            <span className="font-semibold tracking-tight">portaldot-mcp</span>
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">
            The first MCP server for Portaldot. Read chain state and sign transfers in plain language.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <a
              href="https://github.com/Blockchain-Oracle/portaldot-mcp"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <GithubGlyph className="size-4" />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              aria-label="X"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <XGlyph className="size-4" />
            </a>
          </div>
          <p className="pt-2 text-xs text-muted-foreground">
            © {new Date().getFullYear()} portaldot-mcp. MIT licensed.
          </p>
        </AnimatedContainer>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 xl:col-span-2">
          {footerColumns.map((column, index) => (
            <AnimatedContainer key={column.label} delay={0.1 + index * 0.1}>
              <div>
                <h3 className="text-xs font-medium tracking-wide text-foreground uppercase">{column.label}</h3>
                <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                  {column.links.map((link) => (
                    <li key={link.title}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center transition-colors duration-200 hover:text-foreground"
                        >
                          {link.title}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="inline-flex items-center transition-colors duration-200 hover:text-foreground"
                        >
                          {link.title}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </footer>
  );
}

type ViewAnimationProps = {
  delay?: number;
  className?: ComponentProps<typeof motion.div>["className"];
  children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
