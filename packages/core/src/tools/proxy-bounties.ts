import { z } from "zod";
import { createKeyMulti, encodeAddress } from "@polkadot/util-crypto";
import { defineTool } from "../lib/tool";
import { getApi } from "../chain/connection";
import { getSigner } from "../chain/wallet";
import { submitSigned } from "../chain/tx";
import { ok, err } from "../lib/result";
import { potToPlanck, planckToPot } from "../chain/format";
import { SS58_PREFIX } from "../lib/types";

export const addProxy = defineTool({
  name: "portaldot_add_proxy",
  description:
    "Delegate an account to act on your behalf (pallet-proxy). Great for letting an agent key operate with scoped rights. proxyType: Any | NonTransfer | Governance | Staking.",
  inputShape: {
    delegate: z.string().min(2).describe("Account that may act for you"),
    proxyType: z.enum(["Any", "NonTransfer", "Governance", "Staking"]).default("Any"),
    delay: z.number().int().nonnegative().default(0).describe("Announcement delay in blocks"),
  },
  handler: async ({ delegate, proxyType, delay }) => {
    try {
      const api = await getApi();
      const signer = await getSigner();
      const tx = api.tx.proxy.addProxy(delegate, proxyType, delay);
      const res = await submitSigned(api, tx, signer);
      return ok({ owner: signer.address, delegate, proxyType, delay, txHash: res.txHash, blockHash: res.blockHash });
    } catch (e) {
      return err(`add_proxy failed: ${String(e)}`);
    }
  },
});

export const listProxies = defineTool({
  name: "portaldot_list_proxies",
  description: "List the proxy delegates configured for an account (pallet-proxy). Read-only.",
  inputShape: { address: z.string().min(2) },
  handler: async ({ address }) => {
    try {
      const api = await getApi();
      const raw = (await api.query.proxy.proxies(address)).toJSON() as [
        Array<{ delegate: string; proxyType: string; delay: number }>,
        number,
      ];
      const defs = Array.isArray(raw) ? (raw[0] ?? []) : [];
      return ok({
        address,
        proxies: defs.map((d) => ({ delegate: d.delegate, proxyType: d.proxyType, delay: d.delay })),
      });
    } catch (e) {
      return err(`list_proxies failed: ${String(e)}`);
    }
  },
});

export const proposeBounty = defineTool({
  name: "portaldot_propose_bounty",
  description:
    "Propose a treasury bounty on Portaldot (pallet-bounties) — ties into the ecosystem's grants & bounties. Returns the new bounty index.",
  inputShape: {
    value: z.string().describe("Bounty value in POT"),
    description: z.string().min(1),
  },
  handler: async ({ value, description }) => {
    try {
      const api = await getApi();
      const signer = await getSigner();
      const index = Number((await api.query.bounties.bountyCount()).toString());
      const tx = api.tx.bounties.proposeBounty(potToPlanck(value), description);
      const res = await submitSigned(api, tx, signer);
      return ok({ index, value, description, txHash: res.txHash, blockHash: res.blockHash });
    } catch (e) {
      return err(`propose_bounty failed: ${String(e)}`);
    }
  },
});

export const listBounties = defineTool({
  name: "portaldot_list_bounties",
  description: "List bounties on Portaldot with their value, status, and description (pallet-bounties). Read-only.",
  inputShape: {},
  handler: async () => {
    try {
      const api = await getApi();
      const count = Number((await api.query.bounties.bountyCount()).toString());
      const bounties: Array<Record<string, unknown>> = [];
      for (let i = 0; i < count; i++) {
        const b = (await api.query.bounties.bounties(i)).toJSON() as { value?: string | number } | null;
        if (!b) continue;
        const descHuman = (await api.query.bounties.bountyDescriptions(i)).toHuman() as string | null;
        bounties.push({
          index: i,
          valuePot: planckToPot(BigInt(b.value ?? 0)),
          description: descHuman ?? "",
        });
      }
      return ok({ count, bounties });
    } catch (e) {
      return err(`list_bounties failed: ${String(e)}`);
    }
  },
});

export const multisigAddress = defineTool({
  name: "portaldot_multisig_address",
  description:
    "Compute the deterministic multisig account address for a set of signatories and threshold (pallet-multisig). Pure — no chain access.",
  inputShape: {
    signatories: z.array(z.string().min(2)).min(2).describe("All signatory SS58 addresses"),
    threshold: z.number().int().min(1).describe("Approvals required"),
  },
  handler: async ({ signatories, threshold }) => {
    try {
      if (threshold > signatories.length) return err("threshold cannot exceed number of signatories");
      const multi = createKeyMulti(signatories, threshold);
      return ok({ multisig: encodeAddress(multi, SS58_PREFIX), signatories, threshold });
    } catch (e) {
      return err(`multisig_address failed: ${String(e)}`);
    }
  },
});
