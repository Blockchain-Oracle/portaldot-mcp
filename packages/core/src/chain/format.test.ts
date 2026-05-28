import { describe, it, expect } from "vitest";
import { planckToPot, potToPlanck, formatPot, truncateAddress } from "./format";

const ONE_POT = 10n ** 14n;

describe("planckToPot", () => {
  it("formats whole and fractional POT (14 decimals)", () => {
    expect(planckToPot(42n * ONE_POT)).toBe("42");
    expect(planckToPot(ONE_POT / 2n)).toBe("0.5");
    expect(planckToPot(0n)).toBe("0");
    expect(planckToPot(1n)).toBe("0.00000000000001");
  });
});

describe("potToPlanck", () => {
  it("parses POT decimal strings to planck", () => {
    expect(potToPlanck("42")).toBe(42n * ONE_POT);
    expect(potToPlanck("0.5")).toBe(5n * 10n ** 13n);
    expect(potToPlanck("0")).toBe(0n);
  });
  it("rejects garbage", () => {
    expect(() => potToPlanck("abc")).toThrow();
    expect(() => potToPlanck("1.2.3")).toThrow();
  });
  it("round-trips with planckToPot", () => {
    expect(planckToPot(potToPlanck("1"))).toBe("1");
    expect(planckToPot(potToPlanck("1.25"))).toBe("1.25");
    expect(planckToPot(potToPlanck("0.0001"))).toBe("0.0001");
    expect(planckToPot(potToPlanck("1000"))).toBe("1000");
  });
});

describe("formatPot", () => {
  it("appends the POT symbol", () => {
    expect(formatPot(42n * ONE_POT)).toBe("42 POT");
  });
});

describe("truncateAddress", () => {
  it("truncates long addresses and leaves short ones", () => {
    expect(truncateAddress("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")).toBe("5Grwv…KutQY");
    expect(truncateAddress("short")).toBe("short");
  });
});
