import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTask, listTasks, completeTask, getTask } from "./task-ledger";
import { disconnect } from "../chain/connection";

// Real contract test against the LOCAL dev node. Gated on TASK_LEDGER_CONTRACT_ADDRESS:
// skipped (green) until the contract is built + deployed, then run with:
//   TASK_LEDGER_CONTRACT_ADDRESS=... TASK_LEDGER_METADATA_PATH=... \
//   PORTALDOT_RPC_URL=ws://127.0.0.1:9944 PORTALDOT_SEED_PHRASE=//Alice \
//   pnpm --filter @portaldot-mcp/core exec vitest run src/tools/task-ledger.test.ts
const deployed = Boolean(process.env.TASK_LEDGER_CONTRACT_ADDRESS);

describe.skipIf(!deployed)("Task Ledger contract tools (live devnet)", () => {
  beforeAll(() => {
    process.env.PORTALDOT_RPC_URL ??= "ws://127.0.0.1:9944";
    process.env.PORTALDOT_SEED_PHRASE ??= "//Alice";
  });
  afterAll(disconnect);

  it("creates a task on-chain and reads it back", async () => {
    const created = await createTask.handler({ description: "Ship portaldot-mcp" });
    if (!created.ok) throw new Error(created.error);
    const c = created.data as { id: number; txHash: string };
    expect(c.txHash).toMatch(/^0x[0-9a-f]{64}$/);
    expect(typeof c.id).toBe("number");

    const listed = await listTasks.handler({});
    if (!listed.ok) throw new Error(listed.error);
    const l = listed.data as { tasks: Array<{ description: string; completed: boolean }> };
    expect(l.tasks.some((t) => t.description === "Ship portaldot-mcp")).toBe(true);
  }, 60_000);

  it("completes a task and reflects it in state", async () => {
    const created = await createTask.handler({ description: "Complete me" });
    if (!created.ok) throw new Error(created.error);
    const id = (created.data as { id: number }).id;

    const done = await completeTask.handler({ id });
    if (!done.ok) throw new Error(done.error);

    const task = await getTask.handler({ id });
    if (!task.ok) throw new Error(task.error);
    const t = (task.data as { task: { completed: boolean } | null }).task;
    expect(t?.completed).toBe(true);
  }, 60_000);
});
