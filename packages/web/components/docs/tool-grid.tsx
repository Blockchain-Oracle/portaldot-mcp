"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Wallet, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { TOOL_CATALOG, TOOL_COUNT, type ToolEntry } from "@/lib/tools-catalog";

const ALL = "all";

export function ToolGrid() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState(ALL);

  const q = query.trim().toLowerCase();
  const categories = useMemo(
    () =>
      TOOL_CATALOG.map((c) => ({ id: c.id, label: c.label })),
    [],
  );

  const groups = useMemo(() => {
    return TOOL_CATALOG.filter((c) => cat === ALL || c.id === cat)
      .map((c) => ({
        ...c,
        tools: c.tools.filter(
          (t) =>
            !q ||
            t.label.toLowerCase().includes(q) ||
            t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q),
        ),
      }))
      .filter((c) => c.tools.length > 0);
  }, [q, cat]);

  const shown = groups.reduce((n, c) => n + c.tools.length, 0);

  return (
    <div>
      <div className="sticky top-14 z-10 -mx-1 mb-6 bg-background/80 px-1 py-3 backdrop-blur">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${TOOL_COUNT} tools…`}
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-fg-muted focus:border-border-hover"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Pill active={cat === ALL} onClick={() => setCat(ALL)}>
            All
          </Pill>
          {categories.map((c) => (
            <Pill key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
              {c.label}
            </Pill>
          ))}
        </div>
      </div>

      {shown === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">No tools match “{query}”.</p>
      ) : (
        <div className="space-y-10">
          {groups.map((c) => (
            <section key={c.id} id={c.id} className="scroll-mt-32">
              <div className="mb-3">
                <h2 className="font-semibold tracking-tight text-foreground">{c.label}</h2>
                <p className="text-sm text-muted-foreground">{c.blurb}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {c.tools.map((t) => (
                  <ToolCard key={t.name} tool={t} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary/40 bg-primary/12 text-primary"
          : "border-border bg-card text-muted-foreground hover:border-border-hover hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function ToolCard({ tool }: { tool: ToolEntry }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    void navigator.clipboard.writeText(tool.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }
  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-border-hover">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-medium text-foreground">{tool.label}</h3>
            {tool.wallet && (
              <span className="inline-flex items-center gap-1 rounded-full border border-pending/40 bg-pending/10 px-1.5 py-0.5 text-[10px] font-medium text-pending">
                <Wallet className="size-3" /> signs
              </span>
            )}
          </div>
          <code className="font-mono text-[11px] text-fg-muted">{tool.name}</code>
        </div>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
      <button
        type="button"
        onClick={copy}
        className="mt-3 inline-flex items-center justify-between gap-2 rounded-lg border border-border bg-background/40 px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-border-hover hover:text-foreground"
      >
        <span className="truncate font-mono">“{tool.prompt}”</span>
        {copied ? <Check className="size-3.5 shrink-0 text-success" /> : <Copy className="size-3.5 shrink-0 opacity-60 group-hover:opacity-100" />}
      </button>
    </div>
  );
}
