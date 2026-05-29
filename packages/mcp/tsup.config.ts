import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: false,
  clean: true,
  sourcemap: true,
  target: "es2022",
  // Bundle our own @portaldot-mcp/core source in so the published `portaldot-mcp`
  // is self-contained (no workspace dep to resolve on npm). Keep @polkadot/*,
  // pino, and the MCP SDK external — they're declared as runtime dependencies and
  // bundling CJS deps like pino into an ESM bundle breaks their dynamic require()s.
  noExternal: ["@portaldot-mcp/core"],
  banner: { js: "#!/usr/bin/env node" },
});
