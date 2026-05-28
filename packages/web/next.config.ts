import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // core is shipped as TS source via its "." export → let Next transpile it.
  transpilePackages: ["@portaldot-mcp/core"],
  serverExternalPackages: ["@polkadot/api", "@polkadot/api-contract", "pino"],
};

export default nextConfig;
