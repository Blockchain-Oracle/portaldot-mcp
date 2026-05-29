import { ToolGrid } from "@/components/docs/tool-grid";
import { TOOL_COUNT } from "@/lib/tools-catalog";

export const metadata = {
  title: "Tool catalog · portaldot-mcp",
};

export default function ToolsPage() {
  return (
    <div className="max-w-3xl">
      <span className="font-mono text-xs uppercase tracking-widest text-primary">Reference</span>
      <h1 className="mt-3 font-semibold tracking-[-0.02em] text-foreground text-3xl">
        Tool catalog
      </h1>
      <p className="mt-3 text-base text-muted-foreground">
        {TOOL_COUNT} tools the agent can call against Portaldot. Tap any example to copy the prompt — paste it into
        Claude Code or the web app. Tools marked <span className="text-pending">signs</span> submit a transaction.
      </p>
      <div className="mt-8">
        <ToolGrid />
      </div>
    </div>
  );
}
