import { describe, it, expect, afterAll } from "vitest";
import { getBalance } from "./get-balance";
import { getBlockInfo } from "./get-block";
import { estimateFee } from "./estimate-fee";
import { disconnect } from "../chain/connection";

// Real behavior tests against the configured Portaldot endpoint (mainnet by default).
// No mocks — these exercise the live runtime (storage reads, fee calculation).
const ALICE = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
const BOB = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";

describe("portaldot_get_balance (live)", () => {
  afterAll(disconnect);

  it("returns a well-formed balance for a valid address", async () => {
    const res = await getBalance.handler({ address: ALICE });
    if (!res.ok) throw new Error(res.error);
    const d = res.data as {
      address: string;
      free: string;
      reserved: string;
      total: string;
      formatted: string;
    };
    expect(d.address).toBe(ALICE);
    expect(BigInt(d.free) >= 0n).toBe(true);
    expect(BigInt(d.reserved) >= 0n).toBe(true);
    expect(BigInt(d.total)).toBe(BigInt(d.free) + BigInt(d.reserved));
    expect(d.formatted).toMatch(/ POT$/);
  }, 45_000);

  it("errors clearly on a malformed address", async () => {
    const res = await getBalance.handler({ address: "not-an-address" });
    expect(res.ok).toBe(false);
  }, 45_000);
});

describe("portaldot_get_block_info (live)", () => {
  afterAll(disconnect);

  it("returns the latest block with a valid hash and timestamp", async () => {
    const res = await getBlockInfo.handler({});
    if (!res.ok) throw new Error(res.error);
    const d = res.data as { number: number; hash: string; timestamp: number; extrinsics: number };
    expect(d.number).toBeGreaterThan(0);
    expect(d.hash).toMatch(/^0x[0-9a-f]{64}$/);
    expect(d.timestamp).toBeGreaterThan(1_600_000_000_000);
    expect(d.extrinsics).toBeGreaterThanOrEqual(1);
  }, 45_000);

  it("returns genesis (block 0)", async () => {
    const res = await getBlockInfo.handler({ blockNumber: 0 });
    if (!res.ok) throw new Error(res.error);
    const d = res.data as { number: number };
    expect(d.number).toBe(0);
  }, 45_000);
});

describe("portaldot_estimate_fee (live)", () => {
  afterAll(disconnect);

  it("computes a real positive fee from the runtime", async () => {
    const res = await estimateFee.handler({ from: ALICE, to: BOB, amount: "1" });
    if (!res.ok) throw new Error(res.error);
    const d = res.data as { fee: string; feePot: string; formatted: string };
    expect(BigInt(d.fee) > 0n).toBe(true);
    expect(d.formatted).toMatch(/ POT$/);
  }, 45_000);
});
