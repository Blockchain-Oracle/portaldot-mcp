import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: false,
  clean: true,
  sourcemap: true,
  target: "es2022",
  // Keep deps external (core, MCP SDK, @polkadot, pino). Bundling CJS deps like
  // pino into an ESM bundle breaks their dynamic require()s. mcp is a thin
  // wrapper; Node resolves the workspace packages at runtime.
  banner: { js: "#!/usr/bin/env node" },
});
