import { z } from "zod";
import { defineTool } from "../lib/tool";
import { getApi } from "../chain/connection";
import { ok, err } from "../lib/result";
import { formatPot, planckToPot, potToPlanck } from "../chain/format";

export const estimateFee = defineTool({
  name: "portaldot_estimate_fee",
  description:
    "Estimate the POT fee for a balances transfer (transferKeepAlive) from one account to another. Read-only; no signing or funds required.",
  inputShape: {
    from: z.string().min(2).describe("Sender SS58 address (fees are computed against it)"),
    to: z.string().min(2).describe("Recipient SS58 address"),
    amount: z.string().describe("Amount in POT, e.g. '1.5'"),
  },
  handler: async ({ from, to, amount }) => {
    try {
      const api = await getApi();
      const planck = potToPlanck(amount);
      const tx = api.tx.balances.transferKeepAlive(to, planck);
      const info = await tx.paymentInfo(from);
      const fee = BigInt(info.partialFee.toString());
      return ok({
        fee: fee.toString(),
        feePot: planckToPot(fee),
        formatted: formatPot(fee),
      });
    } catch (e) {
      return err(`estimate_fee failed: ${String(e)}`);
    }
  },
});
