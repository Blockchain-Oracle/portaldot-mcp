import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  decodeContractMetadataTool,
  readContractTool,
  dryRunContractTool,
  callContractTool,
} from "./contract-toolkit";
import { disconnect } from "../chain/connection";

const META = `${process.cwd()}/../../contracts/task-ledger/target/ink/task_ledger.json`;
const ADDR = process.env.TASK_LEDGER_CONTRACT_ADDRESS ?? "";
const ALICE = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
const live = Boolean(ADDR);

describe("ink! contract toolkit", () => {
  beforeAll(() => {
    process.env.PORTALDOT_RPC_URL ??= "ws://127.0.0.1:9944";
    process.env.PORTALDOT_SEED_PHRASE ??= "//Alice";
  });
  afterAll(disconnect);

  it("decodes the Task Ledger ABI (no chain access)", async () => {
    const res = await decodeContractMetadataTool.handler({ metadataPath: META });
    if (!res.ok) throw new Error(res.error);
    const d = res.data as {
      messages: Array<{ label: string; mutates: boolean }>;
      constructors: Array<{ label: string }>;
    };
    const labels = d.messages.map((m) => m.label);
    expect(labels).toEqual(expect.arrayContaining(["create_task", "get_tasks"]));
    expect(d.constructors.some((c) => c.label === "new")).toBe(true);
    expect(d.messages.find((m) => m.label === "create_task")?.mutates).toBe(true);
  });

  describe.skipIf(!live)("against the deployed contract", () => {
    it("reads getTasks via read_contract", async () => {
      const res = await readContractTool.handler({
        contractAddress: ADDR,
        metadataPath: META,
        method: "getTasks",
        args: [ALICE],
      });
      if (!res.ok) throw new Error(res.error);
      expect(Array.isArray((res.data as { result: unknown[] }).result)).toBe(true);
    }, 30_000);

    it("dry-runs createTask without broadcasting", async () => {
      const res = await dryRunContractTool.handler({
        contractAddress: ADDR,
        metadataPath: META,
        method: "createTask",
        args: ["dry-run task"],
      });
      if (!res.ok) throw new Error(res.error);
      expect(res.data).toHaveProperty("gasRequired");
    }, 30_000);

    it("calls createTask via call_contract (write)", async () => {
      const res = await callContractTool.handler({
        contractAddress: ADDR,
        metadataPath: META,
        method: "createTask",
        args: ["toolkit task"],
      });
      if (!res.ok) throw new Error(res.error);
      expect((res.data as { txHash: string }).txHash).toMatch(/^0x[0-9a-f]{64}$/);
    }, 60_000);
  });
});
