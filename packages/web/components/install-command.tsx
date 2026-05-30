"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  label: string;
  lang: "bash" | "json";
  command: string;
  prompt?: string;
}

const CLIENTS: Client[] = [
  {
    id: "claude-code",
    label: "Claude Code",
    lang: "bash",
    command: "claude mcp add portaldot -- npx -y portaldot-mcp",
    prompt: "$",
  },
  {
    id: "gemini",
    label: "Gemini CLI",
    lang: "bash",
    command: "gemini mcp add portaldot npx -y portaldot-mcp",
    prompt: "$",
  },
  {
    id: "cursor",
    label: "Cursor",
    lang: "json",
    command: `{
  "mcpServers": {
    "portaldot": { "command": "npx", "args": ["-y", "portaldot-mcp"] }
  }
}`,
    prompt: "~/.cursor/mcp.json",
  },
  {
    id: "claude-desktop",
    label: "Claude Desktop",
    lang: "json",
    command: `{
  "mcpServers": {
    "portaldot": { "command": "npx", "args": ["-y", "portaldot-mcp"] }
  }
}`,
    prompt: "claude_desktop_config.json",
  },
  {
    id: "vscode",
    label: "VS Code",
    lang: "bash",
    command: `code --add-mcp '{"name":"portaldot","command":"npx","args":["-y","portaldot-mcp"]}'`,
    prompt: "$",
  },
];

const TYPE_SPEED_MS = 28;

/*
  Install card rendered as a terminal frame: three chrome dots, a tab strip
  for the clients, then a mono pane that types the command character-by-
  character on every tab change. Copy button persists in the chrome row.
  No auto-cycle — cycling commands is restless and steals attention from
  the rest of the page.
*/
export function InstallCommand({ className }: { className?: string }) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const [typed, setTyped] = useState("");
  const client = CLIENTS[active];

  // Typewriter — restart on every tab change. Bail clean if unmounted.
  useEffect(() => {
    setTyped("");
    let cancelled = false;
    let i = 0;
    const id = setInterval(() => {
      if (cancelled) return;
      i++;
      setTyped(client.command.slice(0, i));
      if (i >= client.command.length) clearInterval(id);
    }, TYPE_SPEED_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [client.command]);

  function copy() {
    void navigator.clipboard.writeText(client.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-2xl bg-card p-1 ring-1 ring-border-strong/60",
        "shadow-[0_24px_60px_-30px_oklch(0_0_0_/_70%)]",
        className,
      )}
    >
      <div className="overflow-hidden rounded-[calc(var(--radius)*1.5)] border border-border bg-surface-2/40">
        {/* Chrome row: three dots + filename + copy */}
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <div className="flex gap-1.5">
            <span aria-hidden className="size-2.5 rounded-full bg-destructive/70" />
            <span aria-hidden className="size-2.5 rounded-full bg-pending/70" />
            <span aria-hidden className="size-2.5 rounded-full bg-success/70" />
          </div>
          <span className="ml-2 truncate font-mono text-[11px] text-fg-muted">
            {client.prompt && client.prompt !== "$" ? client.prompt : "terminal"}
          </span>
          <button
            type="button"
            onClick={copy}
            aria-label="Copy install command"
            className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted transition-colors hover:border-border-strong hover:text-foreground"
          >
            {copied ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
            {copied ? "copied" : "copy"}
          </button>
        </div>

        {/* Tab strip */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-2 py-1.5">
          {CLIENTS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors",
                i === active
                  ? "bg-primary/15 text-primary"
                  : "text-fg-muted hover:text-foreground",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Terminal body */}
        <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-relaxed text-foreground">
          {client.lang === "bash" ? (
            <>
              <span className="text-telemetry">{client.prompt ?? "$"}</span>{" "}
              <span>{typed}</span>
              <Caret />
            </>
          ) : (
            <>
              <span>{typed}</span>
              <Caret />
            </>
          )}
        </pre>
      </div>
    </div>
  );
}

function Caret() {
  return (
    <span
      aria-hidden
      className="ml-0.5 inline-block h-[1.05em] w-[7px] -translate-y-[2px] bg-foreground"
      style={{ animation: "pulse-soft 1.1s ease-in-out infinite" }}
    />
  );
}
