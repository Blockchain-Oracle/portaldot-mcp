import { homedir } from "node:os";
import { join } from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { Keyring } from "@polkadot/keyring";
import { cryptoWaitReady, mnemonicGenerate } from "@polkadot/util-crypto";
import type { KeyringPair } from "@polkadot/keyring/types";
import { SS58_PREFIX } from "../lib/types";
import { logger } from "../lib/logger";

const CONFIG_DIR = join(homedir(), ".portaldot-mcp");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

/** Generate a fresh 12-word mnemonic (headless/auto-wallet, MCP-client context). */
export function generateMnemonic(): string {
  return mnemonicGenerate();
}

/** Derive an sr25519 keypair (ss58:42) from a mnemonic or //Alice-style URI. */
export async function keypairFromUri(uri: string): Promise<KeyringPair> {
  await cryptoWaitReady();
  const keyring = new Keyring({ type: "sr25519", ss58Format: SS58_PREFIX });
  return keyring.addFromUri(uri);
}

/**
 * Resolve the headless signer for the MCP-client context:
 *   env PORTALDOT_SEED_PHRASE  →  persisted ~/.portaldot-mcp/config.json  →  freshly generated (persisted, 0600).
 * The web context never calls this — the browser extension signs there.
 */
export async function getSigner(): Promise<KeyringPair> {
  const envSeed = process.env.PORTALDOT_SEED_PHRASE?.trim();
  if (envSeed) return keypairFromUri(envSeed);

  if (existsSync(CONFIG_FILE)) {
    const cfg = JSON.parse(readFileSync(CONFIG_FILE, "utf8")) as { mnemonic?: string };
    if (!cfg.mnemonic) throw new Error(`${CONFIG_FILE} is missing a 'mnemonic' field`);
    return keypairFromUri(cfg.mnemonic);
  }

  const mnemonic = generateMnemonic();
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, `${JSON.stringify({ mnemonic }, null, 2)}\n`, { mode: 0o600 });
  chmodSync(CONFIG_FILE, 0o600);
  const pair = await keypairFromUri(mnemonic);
  logger.warn(
    { address: pair.address, file: CONFIG_FILE },
    "generated a new Portaldot wallet — fund this address with POT to transact",
  );
  return pair;
}
