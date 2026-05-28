import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { transfer } from "./transfer";
import { getBalance } from "./get-balance";
import { disconnect } from "../chain/connection";

// Real broadcast test against the LOCAL dev node (substrate-contracts-node --dev).
// Alice is prefunded; we sign as Alice via PORTALDOT_SEED_PHRASE="//Alice".
// Asserts in raw base units, so it's independent of the dev chain's display decimals.
const BOB = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";
const ONE_POT = 10n ** 14n;

describe("portaldot_transfer (live devnet)", () => {
  beforeAll(() => {
    process.env.PORTALDOT_RPC_URL = "ws://127.0.0.1:9944";
    process.env.PORTALDOT_SEED_PHRASE = "//Alice";
  });
  afterAll(async () => {
    await disconnect();
    delete process.env.PORTALDOT_RPC_URL;
    delete process.env.PORTALDOT_SEED_PHRASE;
  });

  it("broadcasts a real Alice→Bob transfer; Bob's balance rises by exactly the sent amount", async () => {
    const before = await getBalance.handler({ address: BOB });
    if (!before.ok) throw new Error(before.error);
    const beforeTotal = BigInt((before.data as { total: string }).total);

    const res = await transfer.handler({ to: BOB, amount: "1" });
    if (!res.ok) throw new Error(res.error);
    const d = res.data as { txHash: string; blockHash: string; from: string; feePot: string };
    expect(d.txHash).toMatch(/^0x[0-9a-f]{64}$/);
    expect(d.blockHash).toMatch(/^0x[0-9a-f]{64}$/);

    const after = await getBalance.handler({ address: BOB });
    if (!after.ok) throw new Error(after.error);
    const afterTotal = BigInt((after.data as { total: string }).total);
    expect(afterTotal - beforeTotal).toBe(ONE_POT);
  }, 60_000);

  it("rejects a malformed recipient", async () => {
    const res = await transfer.handler({ to: "not-an-address", amount: "1" });
    expect(res.ok).toBe(false);
  }, 30_000);
});
