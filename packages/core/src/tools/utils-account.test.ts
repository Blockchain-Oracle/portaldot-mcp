import { describe, it, expect, afterAll } from "vitest";
import { generateAccount, validateAddress, convertAddress } from "./utils";
import { multisigAddress } from "./proxy-bounties";
import { accountOverview, chainInfo } from "./account";
import { disconnect } from "../chain/connection";

const ALICE = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
const BOB = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";

describe("dev utils (pure)", () => {
  it("generates a fresh account", async () => {
    const r = await generateAccount.handler({});
    if (!r.ok) throw new Error(r.error);
    const d = r.data as { mnemonic: string; address: string };
    expect(d.mnemonic.split(" ").length).toBe(12);
    expect(d.address.startsWith("5")).toBe(true);
  });

  it("validates addresses", async () => {
    const good = await validateAddress.handler({ address: ALICE });
    if (!good.ok) throw new Error(good.error);
    expect((good.data as { valid: boolean }).valid).toBe(true);
    const bad = await validateAddress.handler({ address: "not-an-address" });
    if (!bad.ok) throw new Error(bad.error);
    expect((bad.data as { valid: boolean }).valid).toBe(false);
  });

  it("converts ss58 prefix and round-trips", async () => {
    const r = await convertAddress.handler({ address: ALICE, ss58Prefix: 0 });
    if (!r.ok) throw new Error(r.error);
    const converted = (r.data as { converted: string }).converted;
    expect(converted).not.toBe(ALICE);
    const back = await convertAddress.handler({ address: converted, ss58Prefix: 42 });
    if (!back.ok) throw new Error(back.error);
    expect((back.data as { converted: string }).converted).toBe(ALICE);
  });

  it("computes an order-independent multisig address", async () => {
    const r1 = await multisigAddress.handler({ signatories: [ALICE, BOB], threshold: 2 });
    const r2 = await multisigAddress.handler({ signatories: [BOB, ALICE], threshold: 2 });
    if (!r1.ok || !r2.ok) throw new Error("multisig failed");
    expect((r1.data as { multisig: string }).multisig).toBe((r2.data as { multisig: string }).multisig);
  });
});

describe("account intelligence (live mainnet)", () => {
  afterAll(disconnect);

  it("chain_info returns the network overview", async () => {
    const r = await chainInfo.handler({});
    if (!r.ok) throw new Error(r.error);
    const d = r.data as { token: string; decimals: number; bestBlock: number };
    expect(d.token).toContain("POT");
    expect(d.decimals).toBe(14);
    expect(d.bestBlock).toBeGreaterThan(0);
  }, 45_000);

  it("account_overview returns a structured summary", async () => {
    const r = await accountOverview.handler({ address: ALICE });
    if (!r.ok) throw new Error(r.error);
    const d = r.data as { balance: { total: string }; staking: { bonded: boolean } };
    expect(d.balance.total).toMatch(/POT$/);
    expect(typeof d.staking.bonded).toBe("boolean");
  }, 45_000);
});
