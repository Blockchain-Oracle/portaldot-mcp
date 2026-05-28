import { z } from "zod";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { u8aToHex } from "@polkadot/util";
import { defineTool } from "../lib/tool";
import { generateMnemonic, keypairFromUri } from "../chain/wallet";
import { ok, err } from "../lib/result";
import { SS58_PREFIX } from "../lib/types";

export const generateAccount = defineTool({
  name: "portaldot_generate_account",
  description:
    "Generate a fresh Portaldot account: a 12-word mnemonic and its SS58 address (prefix 42). The mnemonic is the secret — store it safely.",
  inputShape: {},
  handler: async () => {
    try {
      const mnemonic = generateMnemonic();
      const pair = await keypairFromUri(mnemonic);
      return ok({ address: pair.address, mnemonic });
    } catch (e) {
      return err(`generate_account failed: ${String(e)}`);
    }
  },
});

export const validateAddress = defineTool({
  name: "portaldot_validate_address",
  description: "Check whether a string is a valid SS58 address and return its public-key hex. Pure.",
  inputShape: { address: z.string() },
  handler: async ({ address }) => {
    try {
      const pubkey = decodeAddress(address);
      return ok({ address, valid: true, publicKey: u8aToHex(pubkey) });
    } catch {
      return ok({ address, valid: false });
    }
  },
});

export const convertAddress = defineTool({
  name: "portaldot_convert_address",
  description:
    "Re-encode an address to a different SS58 prefix (e.g. generic 42 ↔ another chain's prefix). Pure.",
  inputShape: {
    address: z.string().min(2),
    ss58Prefix: z.number().int().min(0).default(SS58_PREFIX),
  },
  handler: async ({ address, ss58Prefix }) => {
    try {
      const converted = encodeAddress(decodeAddress(address), ss58Prefix);
      return ok({ original: address, ss58Prefix, converted });
    } catch (e) {
      return err(`convert_address failed: ${String(e)}`);
    }
  },
});
