import { z } from "zod";
import { defineTool } from "../lib/tool";
import { getApi } from "../chain/connection";
import { getSigner } from "../chain/wallet";
import { submitSigned } from "../chain/tx";
import { ok, err } from "../lib/result";
import { potToPlanck } from "../chain/format";

export const batchTransfer = defineTool({
  name: "portaldot_batch_transfer",
  description:
    "Send POT to multiple recipients atomically in ONE transaction (utility.batchAll) — all succeed or all revert, one fee. Ideal for payroll, airdrops, or an agent fanning out payments.",
  inputShape: {
    transfers: z
      .array(z.object({ to: z.string().min(2), amount: z.string() }))
      .min(1)
      .max(100)
      .describe("Recipients and POT amounts"),
  },
  handler: async ({ transfers }) => {
    try {
      const api = await getApi();
      const signer = await getSigner();
      const calls = transfers.map((t) =>
        api.tx.balances.transferKeepAlive(t.to, potToPlanck(t.amount)),
      );
      const tx = api.tx.utility.batchAll(calls);
      const res = await submitSigned(api, tx, signer);
      return ok({ count: transfers.length, transfers, txHash: res.txHash, blockHash: res.blockHash });
    } catch (e) {
      return err(`batch_transfer failed: ${String(e)}`);
    }
  },
});
