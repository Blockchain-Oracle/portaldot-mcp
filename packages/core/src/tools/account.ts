import { z } from "zod";
import { defineTool } from "../lib/tool";
import { getApi } from "../chain/connection";
import { ok, err } from "../lib/result";
import { planckToPot, formatPot } from "../chain/format";

const toBig = (v: string | number | undefined): bigint => (v === undefined ? 0n : BigInt(v));

export const accountOverview = defineTool({
  name: "portaldot_account_overview",
  description:
    "One-shot overview of a Portaldot account: POT balance, on-chain identity, and staking position — aggregated in a single call. Read-only.",
  inputShape: { address: z.string().min(2) },
  handler: async ({ address }) => {
    try {
      const api = await getApi();
      const acct = (await api.query.system.account(address)).toJSON() as {
        nonce?: number;
        data?: { free?: string | number; reserved?: string | number };
      };
      const free = toBig(acct.data?.free);
      const reserved = toBig(acct.data?.reserved);

      const idReg = (await api.query.identity.identityOf(address)).toHuman() as {
        info?: { display?: { Raw?: string } };
      } | null;
      const display = idReg?.info?.display?.Raw ?? null;

      const controller = (await api.query.staking.bonded(address)).toJSON() as string | null;
      let bondedPot = "0";
      if (controller) {
        const ledger = (await api.query.staking.ledger(controller)).toJSON() as {
          active?: string | number;
        } | null;
        bondedPot = planckToPot(toBig(ledger?.active));
      }

      return ok({
        address,
        nonce: acct.nonce ?? 0,
        balance: { free: planckToPot(free), reserved: planckToPot(reserved), total: formatPot(free + reserved) },
        identity: display,
        staking: { bonded: controller !== null, activePot: bondedPot },
      });
    } catch (e) {
      return err(`account_overview failed: ${String(e)}`);
    }
  },
});

export const chainInfo = defineTool({
  name: "portaldot_chain_info",
  description:
    "Portaldot network overview: token, total POT issuance, current staking era, best block, and validator count. Read-only.",
  inputShape: {},
  handler: async () => {
    try {
      const api = await getApi();
      const issuance = BigInt((await api.query.balances.totalIssuance()).toString());
      const era = (await api.query.staking.currentEra()).toJSON() as number | null;
      const header = await api.rpc.chain.getHeader();
      const validatorSet = (await api.query.session.validators()).toJSON() as string[];
      return ok({
        token: api.registry.chainTokens[0] ?? "POT",
        decimals: api.registry.chainDecimals[0] ?? 14,
        ss58Prefix: api.registry.chainSS58 ?? 42,
        totalIssuance: formatPot(issuance),
        currentEra: era,
        bestBlock: header.number.toNumber(),
        validatorCount: validatorSet.length,
      });
    } catch (e) {
      return err(`chain_info failed: ${String(e)}`);
    }
  },
});
