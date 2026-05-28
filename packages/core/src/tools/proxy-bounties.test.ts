import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { addProxy, listProxies, proposeBounty, listBounties } from "./proxy-bounties";
import { disconnect } from "../chain/connection";

const RUN = Boolean(process.env.PORTALDOT_DEV_TESTS);
const BOB = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";
const ALICE = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";

describe.skipIf(!RUN)("proxy + bounties (live Portaldot dev runtime)", () => {
  beforeAll(() => {
    process.env.PORTALDOT_RPC_URL = "ws://127.0.0.1:9945";
    process.env.PORTALDOT_SEED_PHRASE = "//Alice";
  });
  afterAll(async () => {
    await disconnect();
    delete process.env.PORTALDOT_RPC_URL;
    delete process.env.PORTALDOT_SEED_PHRASE;
  });

  it("adds a proxy and lists it", async () => {
    const add = await addProxy.handler({ delegate: BOB, proxyType: "Any", delay: 0 });
    if (!add.ok) throw new Error(add.error);
    const list = await listProxies.handler({ address: ALICE });
    if (!list.ok) throw new Error(list.error);
    expect((list.data as { proxies: unknown[] }).proxies.length).toBeGreaterThanOrEqual(1);
  }, 60_000);

  it("proposes a bounty and lists it", async () => {
    const propose = await proposeBounty.handler({ value: "1000", description: "Build a Portaldot dApp" });
    if (!propose.ok) throw new Error(propose.error);
    const idx = (propose.data as { index: number }).index;
    const list = await listBounties.handler({});
    if (!list.ok) throw new Error(list.error);
    expect((list.data as { bounties: Array<{ index: number }> }).bounties.some((b) => b.index === idx)).toBe(true);
  }, 60_000);
});
