import pino from "pino";

// CRITICAL: MCP stdio transport owns stdout (fd 1) for JSON-RPC. All logs MUST
// go to stderr (fd 2), or they corrupt the protocol stream.
export const logger = pino(
  { level: process.env.LOG_LEVEL ?? "info" },
  pino.destination(2),
);
