"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeBlockCode } from "@/components/ui/code-block";

interface Client {
  id: string;
  label: string;
  lang: string;
  command: string;
}

const CLIENTS: Client[] = [
  { id: "claude-code", label: "Claude Code", lang: "bash", command: "claude mcp add portaldot -- npx -y portaldot-mcp" },
  { id: "gemini", label: "Gemini CLI", lang: "bash", command: "gemini mcp add portaldot npx -y portaldot-mcp" },
  {
    id: "cursor",
    label: "Cursor",
    lang: "json",
    command: `{
  "mcpServers": {
    "portaldot": { "command": "npx", "args": ["-y", "portaldot-mcp"] }
  }
}`,
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
  },
  {
    id: "vscode",
    label: "VS Code",
    lang: "bash",
    command: `code --add-mcp '{"name":"portaldot","command":"npx","args":["-y","portaldot-mcp"]}'`,
  },
];

export function InstallCommand({ className }: { className?: string }) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-cycle clients until the user interacts.
  useEffect(() => {
    if (paused) return;
    timer.current = setTimeout(() => setActive((i) => (i + 1) % CLIENTS.length), 3800);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [active, paused]);

  const client = CLIENTS[active];

  function copy() {
    void navigator.clipboard.writeText(client.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div
      className={cn("w-full overflow-hidden rounded-2xl border border-border bg-card", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-2 py-1.5">
        {CLIENTS.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setActive(i);
              setPaused(true);
            }}
            className={cn(
              "shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              i === active
                ? "bg-primary/12 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={copy}
          aria-label="Copy install command"
          className="absolute right-2.5 top-2.5 z-10 inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-border-hover hover:text-foreground"
        >
          {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
        <CodeBlockCode code={client.command} language={client.lang} theme="github-dark" className="[&>pre]:!bg-card" />
      </div>
    </div>
  );
}
