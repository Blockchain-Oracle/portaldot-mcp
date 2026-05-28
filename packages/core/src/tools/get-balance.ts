import { z } from "zod";
import { defineTool } from "../lib/tool";
import { getApi } from "../chain/connection";
import { ok, err } from "../lib/result";
import { formatPot, planckToPot } from "../chain/format";

const toBig = (v: string | number | undefined): bigint => (v === undefined ? 0n : BigInt(v));

export const getBalance = defineTool({
  name: "portaldot_get_balance",
  description:
    "Get the POT balance of a Portaldot account: free, reserved, and total, with a human-readable POT string.",
  inputShape: {
    address: z.string().min(2).describe("SS58 Portaldot address (prefix 42)"),
  },
  handler: async ({ address }) => {
    try {
      const api = await getApi();
      // toJSON() is runtime-version robust: balances come back as hex strings / numbers.
      const raw = (await api.query.system.account(address)).toJSON() as {
        data?: { free?: string | number; reserved?: string | number };
      };
      const free = toBig(raw.data?.free);
      const reserved = toBig(raw.data?.reserved);
      const total = free + reserved;
      return ok({
        address,
        free: free.toString(),
        reserved: reserved.toString(),
        total: total.toString(),
        freePot: planckToPot(free),
        formatted: formatPot(total),
      });
    } catch (e) {
      return err(`get_balance failed for ${address}: ${String(e)}`);
    }
  },
});
