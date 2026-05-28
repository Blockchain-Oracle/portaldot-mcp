import { describe, it, expect, afterAll } from "vitest";
import { getApi, disconnect } from "./connection";

// Live read-only verification against the configured Portaldot endpoint
// (defaults to wss://mainnet.portaldot.io). No mocks — real chain or fail loudly.
describe("Portaldot chain connection (live)", () => {
  afterAll(async () => {
    await disconnect();
  });

  it("connects and reports chain name + POT properties", async () => {
    const api = await getApi();

    const chain = (await api.rpc.system.chain()).toString();
    expect(chain.toLowerCase()).toContain("portaldot");

    const props = api.registry.getChainProperties();
    expect(props?.tokenSymbol.toString()).toContain("POT");
    expect(props?.tokenDecimals.toString()).toContain("14");
    expect(api.registry.chainSS58).toBe(42);
  }, 45_000);

  it("returns a valid genesis block hash", async () => {
    const api = await getApi();
    const hash = (await api.rpc.chain.getBlockHash(0)).toHex();
    expect(hash).toMatch(/^0x[0-9a-f]{64}$/);
  }, 45_000);
});
