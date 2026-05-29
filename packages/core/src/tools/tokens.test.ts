import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createToken, transferToken, tokenInfo, myTokens } from "./tokens";
import { disconnect } from "../chain/connection";

// Real broadcast tests against the local dev node (pallet-assets present, Alice prefunded).
const BOB = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";
// Local-node write test — opt in with PORTALDOT_DEV_TESTS=1 (node on :9944, Alice funded).
const RUN = Boolean(process.env.PORTALDOT_DEV_TESTS);

describe.skipIf(!RUN)("token tools (live devnet, pallet-assets)", () => {
  let assetId = 0;
  beforeAll(() => {
    process.env.PORTALDOT_RPC_URL = "ws://127.0.0.1:9944";
    process.env.PORTALDOT_SEED_PHRASE = "//Alice";
  });
  afterAll(async () => {
    await disconnect();
    delete process.env.PORTALDOT_RPC_URL;
    delete process.env.PORTALDOT_SEED_PHRASE;
  });

  it("creates a token with metadata + initial supply", async () => {
    const res = await createToken.handler({
      name: "Pizza Coin",
      symbol: "PIZZA",
      decimals: 12,
      initialSupply: "1000000",
    });
    if (!res.ok) throw new Error(res.error);
    const d = res.data as { assetId: number; txHash: string };
    expect(d.txHash).toMatch(/^0x[0-9a-f]{64}$/);
    expect(d.assetId).toBeGreaterThan(0);
    assetId = d.assetId;
  }, 60_000);

  it("reads the token info back", async () => {
    const res = await tokenInfo.handler({ assetId });
    if (!res.ok) throw new Error(res.error);
    const d = res.data as { symbol: string; decimals: number; supplyFormatted: string };
    expect(d.symbol).toBe("PIZZA");
    expect(d.decimals).toBe(12);
    expect(d.supplyFormatted).toBe("1000000");
  }, 30_000);

  it("lists my tokens including the new one", async () => {
    const res = await myTokens.handler({});
    if (!res.ok) throw new Error(res.error);
    const d = res.data as { tokens: Array<{ assetId: number }> };
    expect(d.tokens.some((t) => t.assetId === assetId)).toBe(true);
  }, 30_000);

  it("transfers the token to Bob", async () => {
    const res = await transferToken.handler({ assetId, to: BOB, amount: "100" });
    if (!res.ok) throw new Error(res.error);
    const d = res.data as { txHash: string };
    expect(d.txHash).toMatch(/^0x[0-9a-f]{64}$/);
  }, 60_000);
});
