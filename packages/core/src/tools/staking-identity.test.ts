import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { validators, stakingInfo, stake } from "./staking";
import { setIdentity, resolveAddress } from "./identity";
import { disconnect } from "../chain/connection";

// Real broadcast tests against the native Portaldot dev node (ws://127.0.0.1:9945,
// full runtime, Alice/Bob funded). Run with:
//   PORTALDOT_DEV_TESTS=1 pnpm --filter @portaldot-mcp/core exec vitest run src/tools/staking-identity.test.ts
const RUN = Boolean(process.env.PORTALDOT_DEV_TESTS);
const ALICE = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
const BOB = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";

describe.skipIf(!RUN)("staking / identity / scheduler (live Portaldot dev runtime)", () => {
  beforeAll(() => {
    process.env.PORTALDOT_RPC_URL = "ws://127.0.0.1:9945";
    process.env.PORTALDOT_SEED_PHRASE = "//Alice";
  });
  afterAll(async () => {
    await disconnect();
    delete process.env.PORTALDOT_RPC_URL;
    delete process.env.PORTALDOT_SEED_PHRASE;
  });

  it("lists the active validator set", async () => {
    const r = await validators.handler({});
    if (!r.ok) throw new Error(r.error);
    expect((r.data as { count: number }).count).toBeGreaterThan(0);
  }, 30_000);

  it("reads Alice's staking position (dev validator)", async () => {
    const r = await stakingInfo.handler({ address: ALICE });
    if (!r.ok) throw new Error(r.error);
    expect((r.data as { bonded: boolean }).bonded).toBe(true);
  }, 30_000);

  it("sets and resolves an on-chain identity", async () => {
    const set = await setIdentity.handler({ display: "Alice Portaldot", twitter: "@alice" });
    if (!set.ok) throw new Error(set.error);
    const res = await resolveAddress.handler({ address: ALICE });
    if (!res.ok) throw new Error(res.error);
    expect((res.data as { identity: { display: string } }).identity.display).toBe("Alice Portaldot");
  }, 60_000);

  it("bonds + nominates as Bob", async () => {
    process.env.PORTALDOT_SEED_PHRASE = "//Bob";
    const r = await stake.handler({ amount: "100" });
    process.env.PORTALDOT_SEED_PHRASE = "//Alice";
    if (!r.ok) throw new Error(r.error);
    const info = await stakingInfo.handler({ address: BOB });
    if (!info.ok) throw new Error(info.error);
    expect((info.data as { bonded: boolean }).bonded).toBe(true);
  }, 60_000);
});
