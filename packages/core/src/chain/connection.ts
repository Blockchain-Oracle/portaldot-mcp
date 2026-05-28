import { ApiPromise, WsProvider } from "@polkadot/api";
import { logger } from "../lib/logger";
import { MAINNET_WSS } from "../lib/types";

let apiPromise: Promise<ApiPromise> | null = null;
let currentUrl: string | null = null;

/** Resolve the RPC endpoint: env override, else mainnet. One var flips devnet↔mainnet. */
export function getRpcUrl(): string {
  return process.env.PORTALDOT_RPC_URL ?? MAINNET_WSS;
}

/** Get a ready ApiPromise singleton for the given endpoint (memoized per URL). */
export async function getApi(rpcUrl: string = getRpcUrl()): Promise<ApiPromise> {
  if (apiPromise && currentUrl === rpcUrl) return apiPromise;
  currentUrl = rpcUrl;
  apiPromise = connectWithRetry(rpcUrl);
  return apiPromise;
}

async function connectWithRetry(rpcUrl: string, maxRetries = 3): Promise<ApiPromise> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const provider = new WsProvider(rpcUrl);
      const api = await ApiPromise.create({ provider, noInitWarn: true });
      await api.isReady;
      const chain = (await api.rpc.system.chain()).toString();
      logger.info({ rpcUrl, chain }, "connected to Portaldot");
      return api;
    } catch (e) {
      lastErr = e;
      logger.warn({ attempt, rpcUrl, err: String(e) }, "chain connection failed; retrying");
      await new Promise((r) => setTimeout(r, attempt * 1000));
    }
  }
  apiPromise = null;
  currentUrl = null;
  throw new Error(`failed to connect to ${rpcUrl} after ${maxRetries} attempts: ${String(lastErr)}`);
}

/** Tear down the singleton (used in tests and graceful shutdown). */
export async function disconnect(): Promise<void> {
  if (!apiPromise) return;
  const api = await apiPromise.catch(() => null);
  await api?.disconnect();
  apiPromise = null;
  currentUrl = null;
}
