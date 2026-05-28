import { z } from "zod";
import { defineTool } from "../lib/tool";
import { getApi } from "../chain/connection";
import { getSigner } from "../chain/wallet";
import { ok, err, type Result } from "../lib/result";
import { planckToPot, potToPlanck } from "../chain/format";

export const transfer = defineTool({
  name: "portaldot_transfer",
  description:
    "Transfer POT to an address via balances.transferKeepAlive, signed by the server's headless wallet. Waits for block inclusion and returns the tx hash, block hash, and fee.",
  inputShape: {
    to: z.string().min(2).describe("Recipient SS58 address (prefix 42)"),
    amount: z.string().describe("Amount in POT, e.g. '1.5'"),
  },
  handler: async ({ to, amount }) => {
    try {
      const api = await getApi();
      const signer = await getSigner();
      const planck = potToPlanck(amount);
      const tx = api.tx.balances.transferKeepAlive(to, planck);
      const info = await tx.paymentInfo(signer.address);
      const fee = BigInt(info.partialFee.toString());

      return await new Promise<Result<unknown>>((resolve) => {
        let unsub: (() => void) | undefined;
        tx.signAndSend(signer, ({ status, dispatchError, txHash }) => {
          if (dispatchError) {
            let reason = dispatchError.toString();
            if (dispatchError.isModule) {
              const decoded = api.registry.findMetaError(dispatchError.asModule);
              reason = `${decoded.section}.${decoded.name}: ${decoded.docs.join(" ")}`;
            }
            unsub?.();
            resolve(err(`transfer reverted — ${reason}`));
          } else if (status.isInBlock) {
            unsub?.();
            resolve(
              ok({
                from: signer.address,
                to,
                amountPot: planckToPot(planck),
                txHash: txHash.toHex(),
                blockHash: status.asInBlock.toHex(),
                fee: fee.toString(),
                feePot: planckToPot(fee),
              }),
            );
          }
        })
          .then((u) => {
            unsub = u;
          })
          .catch((e: unknown) => resolve(err(`transfer failed: ${String(e)}`)));
      });
    } catch (e) {
      return err(`transfer failed: ${String(e)}`);
    }
  },
});
