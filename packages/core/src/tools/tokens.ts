import { z } from "zod";
import { defineTool } from "../lib/tool";
import { getApi } from "../chain/connection";
import { getSigner } from "../chain/wallet";
import { submitSigned } from "../chain/tx";
import { ok, err } from "../lib/result";
import { potToPlanck, planckToPot } from "../chain/format";
import type { ApiPromise } from "@polkadot/api";

async function findFreeAssetId(api: ApiPromise): Promise<number> {
  for (let i = 0; i < 12; i++) {
    const id = 1_000 + Math.floor(Math.random() * 9_000_000);
    const existing = (await api.query.assets.asset(id)).toJSON();
    if (existing === null) return id;
  }
  throw new Error("could not find a free asset id");
}

async function assetDecimals(api: ApiPromise, assetId: number): Promise<number> {
  const meta = (await api.query.assets.metadata(assetId)).toHuman() as { decimals?: string };
  return Number(meta.decimals ?? "0");
}

export const createToken = defineTool({
  name: "portaldot_create_token",
  description:
    "Create a fungible token on Portaldot (pallet-assets): registers the asset, sets metadata, and mints the initial supply to the creator — all in one atomic batch. Returns the new asset id.",
  inputShape: {
    name: z.string().min(1).describe("Token name, e.g. 'Pizza Coin'"),
    symbol: z.string().min(1).max(12).describe("Ticker, e.g. 'PIZZA'"),
    decimals: z.number().int().min(0).max(18).default(12),
    initialSupply: z.string().describe("Initial supply in whole tokens, e.g. '1000000'"),
  },
  handler: async ({ name, symbol, decimals, initialSupply }) => {
    try {
      const api = await getApi();
      const signer = await getSigner();
      const assetId = await findFreeAssetId(api);
      const supplyRaw = potToPlanck(initialSupply, decimals);
      const batch = api.tx.utility.batchAll([
        api.tx.assets.create(assetId, signer.address, 1),
        api.tx.assets.setMetadata(assetId, name, symbol, decimals),
        api.tx.assets.mint(assetId, signer.address, supplyRaw),
      ]);
      const res = await submitSigned(api, batch, signer);
      return ok({
        assetId,
        name,
        symbol,
        decimals,
        initialSupply,
        owner: signer.address,
        txHash: res.txHash,
        blockHash: res.blockHash,
      });
    } catch (e) {
      return err(`create_token failed: ${String(e)}`);
    }
  },
});

export const mintToken = defineTool({
  name: "portaldot_mint_token",
  description: "Mint more of a token you control to an address (pallet-assets).",
  inputShape: {
    assetId: z.number().int().nonnegative(),
    to: z.string().optional().describe("Recipient; defaults to the server wallet"),
    amount: z.string().describe("Amount in whole tokens"),
  },
  handler: async ({ assetId, to, amount }) => {
    try {
      const api = await getApi();
      const signer = await getSigner();
      const dec = await assetDecimals(api, assetId);
      const raw = potToPlanck(amount, dec);
      const tx = api.tx.assets.mint(assetId, to ?? signer.address, raw);
      const res = await submitSigned(api, tx, signer);
      return ok({ assetId, to: to ?? signer.address, amount, txHash: res.txHash, blockHash: res.blockHash });
    } catch (e) {
      return err(`mint_token failed: ${String(e)}`);
    }
  },
});

export const transferToken = defineTool({
  name: "portaldot_transfer_token",
  description: "Transfer a fungible token to an address (pallet-assets).",
  inputShape: {
    assetId: z.number().int().nonnegative(),
    to: z.string().min(2),
    amount: z.string().describe("Amount in whole tokens"),
  },
  handler: async ({ assetId, to, amount }) => {
    try {
      const api = await getApi();
      const signer = await getSigner();
      const dec = await assetDecimals(api, assetId);
      const tx = api.tx.assets.transfer(assetId, to, potToPlanck(amount, dec));
      const res = await submitSigned(api, tx, signer);
      return ok({ assetId, to, amount, txHash: res.txHash, blockHash: res.blockHash });
    } catch (e) {
      return err(`transfer_token failed: ${String(e)}`);
    }
  },
});

export const tokenInfo = defineTool({
  name: "portaldot_token_info",
  description: "Get a token's metadata and supply (pallet-assets). Read-only.",
  inputShape: { assetId: z.number().int().nonnegative() },
  handler: async ({ assetId }) => {
    try {
      const api = await getApi();
      const asset = (await api.query.assets.asset(assetId)).toJSON() as null | {
        owner?: string;
        supply?: string | number;
      };
      if (asset === null) return err(`token ${assetId} does not exist`);
      const meta = (await api.query.assets.metadata(assetId)).toHuman() as {
        name?: string;
        symbol?: string;
        decimals?: string;
      };
      const decimals = Number(meta.decimals ?? "0");
      const supply = BigInt(asset.supply ?? 0);
      return ok({
        assetId,
        name: meta.name ?? "",
        symbol: meta.symbol ?? "",
        decimals,
        owner: asset.owner ?? "",
        supply: supply.toString(),
        supplyFormatted: planckToPot(supply, decimals),
      });
    } catch (e) {
      return err(`token_info failed: ${String(e)}`);
    }
  },
});

export const myTokens = defineTool({
  name: "portaldot_my_tokens",
  description: "List tokens created/owned by an address (pallet-assets). Defaults to the server wallet.",
  inputShape: { owner: z.string().optional() },
  handler: async ({ owner }) => {
    try {
      const api = await getApi();
      const who = owner ?? (await getSigner()).address;
      const entries = await api.query.assets.asset.entries();
      const tokens: Array<Record<string, unknown>> = [];
      for (const [key, value] of entries) {
        const details = value.toJSON() as { owner?: string; supply?: string | number } | null;
        if (!details || details.owner !== who) continue;
        const assetId = Number((key.args[0] as { toString(): string }).toString());
        const meta = (await api.query.assets.metadata(assetId)).toHuman() as {
          name?: string;
          symbol?: string;
          decimals?: string;
        };
        const decimals = Number(meta.decimals ?? "0");
        tokens.push({
          assetId,
          name: meta.name ?? "",
          symbol: meta.symbol ?? "",
          decimals,
          supplyFormatted: planckToPot(BigInt(details.supply ?? 0), decimals),
        });
      }
      return ok({ owner: who, tokens });
    } catch (e) {
      return err(`my_tokens failed: ${String(e)}`);
    }
  },
});
