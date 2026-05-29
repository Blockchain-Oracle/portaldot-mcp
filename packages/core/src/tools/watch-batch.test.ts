import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { watchBalance } from "./watch";
import { batchTransfer } from "./batch";
import { transfer } from "./transfer";
import { getBalance } from "./get-balance";
import { disconnect } from "../chain/connection";

// Real tests against the local dev node (balances + utility, Alice funded).
const BOB = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";
const CHARLIE = "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y";
const ONE_POT = 10n ** 14n;

async function freeOf(address: string): Promise<bigint> {
  const r = await getBalance.handler({ address });
  if (!r.ok) throw new Error(r.error);
  return BigInt((r.data as { free: string }).free);
}

// Local-node write test — opt in with PORTALDOT_DEV_TESTS=1 (node on :9944, Alice funded).
const RUN = Boolean(process.env.PORTALDOT_DEV_TESTS);

describe.skipIf(!RUN)("watch + batch (live devnet)", () => {
  beforeAll(() => {
    process.env.PORTALDOT_RPC_URL = "ws://127.0.0.1:9944";
    process.env.PORTALDOT_SEED_PHRASE = "//Alice";
  });
  afterAll(async () => {
    await disconnect();
    delete process.env.PORTALDOT_RPC_URL;
    delete process.env.PORTALDOT_SEED_PHRASE;
  });

  it("watch_balance captures a live balance change", async () => {
    const [watch] = await Promise.all([
      watchBalance.handler({ address: BOB, seconds: 8 }),
      (async () => {
        await new Promise((r) => setTimeout(r, 2500));
        await transfer.handler({ to: BOB, amount: "1" });
      })(),
    ]);
    if (!watch.ok) throw new Error(watch.error);
    expect((watch.data as { changes: number }).changes).toBeGreaterThanOrEqual(1);
  }, 30_000);

  it("batch_transfer sends to multiple recipients atomically", async () => {
    const beforeCharlie = await freeOf(CHARLIE);
    const res = await batchTransfer.handler({
      transfers: [
        { to: BOB, amount: "1" },
        { to: CHARLIE, amount: "2" },
      ],
    });
    if (!res.ok) throw new Error(res.error);
    expect((res.data as { txHash: string }).txHash).toMatch(/^0x[0-9a-f]{64}$/);
    const afterCharlie = await freeOf(CHARLIE);
    expect(afterCharlie - beforeCharlie).toBe(2n * ONE_POT);
  }, 30_000);
});
