import { z } from "zod";
import { defineTool } from "../lib/tool";
import { getApi } from "../chain/connection";
import { getSigner } from "../chain/wallet";
import { submitSigned } from "../chain/tx";
import { ok, err } from "../lib/result";
import { potToPlanck, planckToPot } from "../chain/format";

export const stake = defineTool({
  name: "portaldot_stake",
  description:
    "Bond POT and nominate validators in one atomic batch (pallet-staking). Defaults to nominating the current active validator set. Signed by the server wallet.",
  inputShape: {
    amount: z.string().describe("POT to bond, e.g. '100'"),
    validators: z
      .array(z.string())
      .optional()
      .describe("Validator stash addresses to nominate; defaults to the active set"),
  },
  handler: async ({ amount, validators }) => {
    try {
      const api = await getApi();
      const signer = await getSigner();
      const targets =
        validators && validators.length > 0
          ? validators
          : ((await api.query.session.validators()).toJSON() as string[]);
      if (!targets || targets.length === 0) return err("no validators available to nominate");
      const tx = api.tx.utility.batchAll([
        api.tx.staking.bond(signer.address, potToPlanck(amount), "Staked"),
        api.tx.staking.nominate(targets),
      ]);
      const res = await submitSigned(api, tx, signer);
      return ok({
        address: signer.address,
        bonded: amount,
        nominated: targets,
        txHash: res.txHash,
        blockHash: res.blockHash,
      });
    } catch (e) {
      return err(`stake failed: ${String(e)}`);
    }
  },
});

export const validators = defineTool({
  name: "portaldot_validators",
  description: "List the current active validators on Portaldot (pallet-staking). Read-only.",
  inputShape: {},
  handler: async () => {
    try {
      const api = await getApi();
      const set = (await api.query.session.validators()).toJSON() as string[];
      return ok({ count: set.length, validators: set });
    } catch (e) {
      return err(`validators failed: ${String(e)}`);
    }
  },
});

export const stakingInfo = defineTool({
  name: "portaldot_staking_info",
  description:
    "Get an account's staking position on Portaldot: whether it's bonded, the active/total bonded POT, and who it nominates. Read-only.",
  inputShape: { address: z.string().min(2) },
  handler: async ({ address }) => {
    try {
      const api = await getApi();
      const controller = (await api.query.staking.bonded(address)).toJSON() as string | null;
      const ledger = controller
        ? ((await api.query.staking.ledger(controller)).toJSON() as {
            active?: string | number;
            total?: string | number;
          } | null)
        : null;
      const nominators = (await api.query.staking.nominators(address)).toJSON() as {
        targets?: string[];
      } | null;
      const active = ledger?.active ? BigInt(ledger.active) : 0n;
      const total = ledger?.total ? BigInt(ledger.total) : 0n;
      return ok({
        address,
        bonded: controller !== null,
        activePot: planckToPot(active),
        totalPot: planckToPot(total),
        nominating: nominators?.targets ?? [],
      });
    } catch (e) {
      return err(`staking_info failed: ${String(e)}`);
    }
  },
});
