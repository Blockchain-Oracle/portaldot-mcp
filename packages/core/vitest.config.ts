import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Live tests mutate process.env (PORTALDOT_RPC_URL / seed) per file to target
    // mainnet vs the local devnet. Run files sequentially so those never overlap.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
