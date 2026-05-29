import { promises as fs } from "node:fs";
import path from "node:path";
import { SkillContent } from "@/components/docs/skill-content";

export const metadata = {
  title: "Agent skill · portaldot-mcp",
};

async function loadSkill(): Promise<string> {
  try {
    return await fs.readFile(path.join(process.cwd(), "public", "skill.md"), "utf-8");
  } catch {
    return "";
  }
}

export default async function SkillPage() {
  const content = await loadSkill();
  return (
    <div className="max-w-2xl">
      <span className="font-mono text-xs uppercase tracking-widest text-primary">Agent skill</span>
      <h1 className="mt-3 font-semibold tracking-[-0.02em] text-foreground text-3xl">Install the skill</h1>
      <p className="mt-3 text-base text-muted-foreground">
        A cross-client Agent Skill that teaches any agent <em>when</em> and <em>how</em> to use Portaldot&apos;s tools —
        intent→tool mapping, parameter guide, and example workflows. Works in Claude, Cursor, Windsurf, or any
        MCP host. Pick a method:
      </p>
      <div className="mt-8">
        <SkillContent content={content} />
      </div>
    </div>
  );
}
