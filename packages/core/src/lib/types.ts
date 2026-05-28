import type { z } from "zod";
import type { Result } from "./result";

export const MAINNET_WSS = "wss://mainnet.portaldot.io";
export const LOCAL_WSS = "ws://127.0.0.1:9944";
export const POT_DECIMALS = 14;
export const SS58_PREFIX = 42;
export const POT_SYMBOL = "POT";

/** A zod "raw shape": the `{ field: schema }` object passed to `z.object()`. */
export type RawShape = Record<string, z.ZodType>;

/**
 * Framework-agnostic tool definition. `core` exposes these; the `mcp` package
 * adapts them to MCP tool registrations (raw shape) and the `web` app adapts
 * them to AI SDK tools (`z.object(inputShape)`). Keeps `core` transport-free.
 * Build these with `defineTool` for type-safe handlers.
 */
export interface ToolDef {
  name: string;
  description: string;
  inputShape: RawShape;
  handler: (input: Record<string, unknown>) => Promise<Result<unknown>>;
}
