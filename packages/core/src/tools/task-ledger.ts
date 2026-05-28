import { z } from "zod";
import { defineTool } from "../lib/tool";
import { getApi } from "../chain/connection";
import { getSigner } from "../chain/wallet";
import { getTaskLedger, callContract, queryContract } from "../chain/contract";
import { ok, err } from "../lib/result";

// Any valid address works as the origin of a read-only query.
const READ_ORIGIN = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";

export const createTask = defineTool({
  name: "portaldot_create_task",
  description:
    "Create a task on the Portaldot Agent Task Ledger ink! contract (signed by the server wallet, POT gas). Returns the new task id and tx hash.",
  inputShape: { description: z.string().min(1).describe("What the task is") },
  handler: async ({ description }) => {
    try {
      const api = await getApi();
      const signer = await getSigner();
      const contract = getTaskLedger(api);
      const res = await callContract(api, contract, signer, "createTask", [description]);
      return ok({ id: res.output, owner: signer.address, txHash: res.txHash, blockHash: res.blockHash });
    } catch (e) {
      return err(`create_task failed: ${String(e)}`);
    }
  },
});

export const completeTask = defineTool({
  name: "portaldot_complete_task",
  description: "Mark a task complete on the Task Ledger. Only the task's owner can complete it.",
  inputShape: { id: z.number().int().nonnegative().describe("Task id") },
  handler: async ({ id }) => {
    try {
      const api = await getApi();
      const signer = await getSigner();
      const contract = getTaskLedger(api);
      const res = await callContract(api, contract, signer, "completeTask", [id]);
      return ok({ id, txHash: res.txHash, blockHash: res.blockHash });
    } catch (e) {
      return err(`complete_task failed: ${String(e)}`);
    }
  },
});

export const listTasks = defineTool({
  name: "portaldot_list_tasks",
  description: "List Task Ledger tasks for an owner (defaults to the server wallet). Read-only.",
  inputShape: {
    owner: z.string().optional().describe("SS58 owner address; defaults to the server wallet"),
  },
  handler: async ({ owner }) => {
    try {
      const api = await getApi();
      const contract = getTaskLedger(api);
      const who = owner ?? (await getSigner()).address;
      const tasks = await queryContract(api, contract, who, "getTasks", [who]);
      return ok({ owner: who, tasks });
    } catch (e) {
      return err(`list_tasks failed: ${String(e)}`);
    }
  },
});

export const getTask = defineTool({
  name: "portaldot_get_task",
  description: "Get a single Task Ledger task by id. Read-only.",
  inputShape: { id: z.number().int().nonnegative().describe("Task id") },
  handler: async ({ id }) => {
    try {
      const api = await getApi();
      const contract = getTaskLedger(api);
      const task = await queryContract(api, contract, READ_ORIGIN, "getTask", [id]);
      return ok({ id, task });
    } catch (e) {
      return err(`get_task failed: ${String(e)}`);
    }
  },
});
