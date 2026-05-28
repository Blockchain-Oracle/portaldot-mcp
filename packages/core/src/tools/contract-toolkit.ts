import { z } from "zod";
import { readFileSync } from "node:fs";
import { defineTool } from "../lib/tool";
import { getApi } from "../chain/connection";
import { getSigner } from "../chain/wallet";
import { loadContract, queryContract, callContract, dryRunQuery } from "../chain/contract";
import { ok, err } from "../lib/result";

const READ_ORIGIN = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";

function readMeta(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
}

export const callContractTool = defineTool({
  name: "portaldot_call_contract",
  description:
    "Call (write) a method on ANY deployed ink! contract on Portaldot, signed by the server wallet. Provide the contract address, the path to its metadata .json, the method name, and args.",
  inputShape: {
    contractAddress: z.string().min(2),
    metadataPath: z.string().describe("Path to the contract's ink! metadata .json"),
    method: z.string().describe("Message name (camelCase), e.g. 'createTask'"),
    args: z.array(z.unknown()).default([]),
  },
  handler: async ({ contractAddress, metadataPath, method, args }) => {
    try {
      const api = await getApi();
      const signer = await getSigner();
      const contract = loadContract(api, readMeta(metadataPath), contractAddress);
      const res = await callContract(api, contract, signer, method, args);
      return ok({ method, output: res.output, txHash: res.txHash, blockHash: res.blockHash });
    } catch (e) {
      return err(`call_contract failed: ${String(e)}`);
    }
  },
});

export const readContractTool = defineTool({
  name: "portaldot_read_contract",
  description: "Read (query) a method on ANY deployed ink! contract. Read-only, no signing.",
  inputShape: {
    contractAddress: z.string().min(2),
    metadataPath: z.string(),
    method: z.string(),
    args: z.array(z.unknown()).default([]),
  },
  handler: async ({ contractAddress, metadataPath, method, args }) => {
    try {
      const api = await getApi();
      const contract = loadContract(api, readMeta(metadataPath), contractAddress);
      const result = await queryContract(api, contract, READ_ORIGIN, method, args);
      return ok({ method, result });
    } catch (e) {
      return err(`read_contract failed: ${String(e)}`);
    }
  },
});

export const dryRunContractTool = defineTool({
  name: "portaldot_dry_run_contract",
  description:
    "Dry-run an ink! contract method WITHOUT broadcasting — returns the would-be output and estimated gas. Use before call_contract to preview the result safely.",
  inputShape: {
    contractAddress: z.string().min(2),
    metadataPath: z.string(),
    method: z.string(),
    args: z.array(z.unknown()).default([]),
    caller: z.string().optional(),
  },
  handler: async ({ contractAddress, metadataPath, method, args, caller }) => {
    try {
      const api = await getApi();
      const who = caller ?? READ_ORIGIN;
      const contract = loadContract(api, readMeta(metadataPath), contractAddress);
      const { output, gasRequired } = await dryRunQuery(api, contract, who, method, args);
      return ok({ method, output, gasRequired });
    } catch (e) {
      return err(`dry_run_contract failed: ${String(e)}`);
    }
  },
});

interface AbiArg {
  label: string;
}
interface AbiMessage {
  label: string;
  mutates?: boolean;
  payable?: boolean;
  args?: AbiArg[];
}
interface AbiSpec {
  messages?: AbiMessage[];
  constructors?: Array<{ label: string; args?: AbiArg[] }>;
  events?: Array<{ label: string }>;
}

export const decodeContractMetadataTool = defineTool({
  name: "portaldot_decode_contract_metadata",
  description:
    "Inspect an ink! contract's ABI from its metadata .json: list constructors, messages (with mutability + payable), and events. No chain access needed.",
  inputShape: { metadataPath: z.string() },
  handler: async ({ metadataPath }) => {
    try {
      const json = readMeta(metadataPath);
      const spec = (json.spec ?? {}) as AbiSpec;
      const contract = json.contract as { name?: string } | undefined;
      return ok({
        name: contract?.name ?? "",
        constructors: (spec.constructors ?? []).map((c) => ({
          label: c.label,
          args: (c.args ?? []).map((a) => a.label),
        })),
        messages: (spec.messages ?? []).map((m) => ({
          label: m.label,
          mutates: m.mutates ?? false,
          payable: m.payable ?? false,
          args: (m.args ?? []).map((a) => a.label),
        })),
        events: (spec.events ?? []).map((e) => e.label),
      });
    } catch (e) {
      return err(`decode_contract_metadata failed: ${String(e)}`);
    }
  },
});
