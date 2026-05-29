import { z } from "zod";
import type { Codec } from "@polkadot/types/types";
import { defineTool } from "../lib/tool";
import { getApi } from "../chain/connection";
import { ok, err } from "../lib/result";
import { planckToPot } from "../chain/format";

export const watchBalance = defineTool({
  name: "portaldot_watch_balance",
  description:
    "Watch an address's POT balance for N seconds and report every change in real time, using Portaldot's native storage subscriptions. Bounded (max 60s). Agent-native monitoring.",
  inputShape: {
    address: z.string().min(2),
    seconds: z.number().int().min(1).max(60).default(15).describe("How long to watch"),
  },
  handler: async ({ address, seconds }) => {
    try {
      const api = await getApi();
      const updates: Array<{ free: string; freePot: string }> = [];
      let initial: bigint | null = null;

      // @polkadot/api's generic storage entry resolves `(arg, cb)` to the one-shot
      // Promise<Codec> overload (no chain augmentation in this project), so the
      // subscription form is asserted here: callback yields a Codec, returns the unsub fn.
      const subscribeAccount = api.query.system.account as unknown as (
        addr: string,
        cb: (acct: Codec) => void,
      ) => Promise<() => void>;

      const unsub = await subscribeAccount(address, (acct) => {
        const free = BigInt(
          (acct.toJSON() as { data?: { free?: string | number } }).data?.free ?? 0,
        );
        // First callback is the current value — record as baseline, not a "change".
        if (initial === null) {
          initial = free;
          return;
        }
        updates.push({ free: free.toString(), freePot: planckToPot(free) });
      });

      await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
      unsub();

      return ok({
        address,
        watchedSeconds: seconds,
        initialFreePot: planckToPot(initial ?? 0n),
        changes: updates.length,
        updates,
      });
    } catch (e) {
      return err(`watch_balance failed: ${String(e)}`);
    }
  },
});
