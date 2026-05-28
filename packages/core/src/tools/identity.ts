import { z } from "zod";
import { defineTool } from "../lib/tool";
import { getApi } from "../chain/connection";
import { getSigner } from "../chain/wallet";
import { submitSigned } from "../chain/tx";
import { ok, err } from "../lib/result";

function data(value?: string): { Raw: string } | { None: null } {
  return value ? { Raw: value } : { None: null };
}

export const setIdentity = defineTool({
  name: "portaldot_set_identity",
  description:
    "Set your on-chain identity on Portaldot (pallet-identity): display name plus optional email, web, and twitter. Signed by the server wallet.",
  inputShape: {
    display: z.string().min(1).max(32),
    email: z.string().optional(),
    web: z.string().optional(),
    twitter: z.string().optional(),
  },
  handler: async ({ display, email, web, twitter }) => {
    try {
      const api = await getApi();
      const signer = await getSigner();
      const info = {
        additional: [],
        display: { Raw: display },
        legal: { None: null },
        web: data(web),
        riot: { None: null },
        email: data(email),
        pgpFingerprint: null,
        image: { None: null },
        twitter: data(twitter),
      };
      const tx = api.tx.identity.setIdentity(info);
      const res = await submitSigned(api, tx, signer);
      return ok({ address: signer.address, display, txHash: res.txHash, blockHash: res.blockHash });
    } catch (e) {
      return err(`set_identity failed: ${String(e)}`);
    }
  },
});

export const resolveAddress = defineTool({
  name: "portaldot_resolve_address",
  description:
    "Resolve an address's on-chain identity (display name, email, web, twitter) on Portaldot. Read-only. Returns null identity if unregistered.",
  inputShape: { address: z.string().min(2) },
  handler: async ({ address }) => {
    try {
      const api = await getApi();
      const reg = (await api.query.identity.identityOf(address)).toHuman() as {
        info?: Record<string, unknown>;
      } | null;
      if (!reg?.info) return ok({ address, identity: null });
      const read = (d: unknown): string | null =>
        d && typeof d === "object" && "Raw" in d ? String((d as { Raw: string }).Raw) : null;
      const info = reg.info;
      return ok({
        address,
        identity: {
          display: read(info.display),
          email: read(info.email),
          web: read(info.web),
          twitter: read(info.twitter),
        },
      });
    } catch (e) {
      return err(`resolve_address failed: ${String(e)}`);
    }
  },
});
