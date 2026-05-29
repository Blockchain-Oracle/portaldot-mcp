"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ChevronDown, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Markdown } from "@/components/app/markdown";

function CopyRow({ label, value, note }: { label: string; value: string; note?: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    void navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1700);
  }
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="font-medium text-foreground">{label}</h3>
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-secondary px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-border-hover hover:text-foreground"
        >
          {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-lg border border-border bg-background/50 px-3 py-2 font-mono text-xs leading-relaxed text-foreground">
        {value}
      </pre>
      {note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

export function SkillContent({ content }: { content: string }) {
  const [origin, setOrigin] = useState("https://your-deployment");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Strip YAML frontmatter for the human-readable preview.
  const body = content.replace(/^---[\s\S]*?---\n/, "").trim();

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <CopyRow
          label="1. Just tell your agent"
          value={`Read ${origin}/skill.md and follow the instructions to install Portaldot MCP.`}
          note="The simplest path — paste this into Claude, Cursor, or any agent and it self-installs."
        />
        <CopyRow
          label="2. skills CLI"
          value="pnpm dlx skills add github:Blockchain-Oracle/portaldot-mcp --skill portaldot"
          note="Installs the skill into your client from the repo."
        />
        <CopyRow
          label="3. Manual"
          value={`# copy the skill into Claude's skills dir
mkdir -p ~/.claude/skills/portaldot
curl -fsSL ${origin}/skill.md -o ~/.claude/skills/portaldot/SKILL.md`}
          note="Drop SKILL.md into your client's skills directory."
        />
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
        >
          <span className="font-medium text-foreground">View the full skill</span>
          <span className="flex items-center gap-3">
            <a
              href="/skill.md"
              download="portaldot-SKILL.md"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Download className="size-3.5" /> skill.md
            </a>
            <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
          </span>
        </button>
        {open && (
          <div className="border-t border-border px-5 py-5">
            <Markdown>{body}</Markdown>
          </div>
        )}
      </div>
    </div>
  );
}
