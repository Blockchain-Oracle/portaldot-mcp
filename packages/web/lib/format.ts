// Client-safe formatting (pure). Mirrors @portaldot-mcp/core's format helpers —
// duplicated here so the browser bundle never imports core's Node-only modules.
const POT_DECIMALS = 14;

export function planckToPot(raw: bigint, decimals = POT_DECIMALS): string {
  const neg = raw < 0n;
  const v = neg ? -raw : raw;
  const base = 10n ** BigInt(decimals);
  const whole = v / base;
  const frac = (v % base).toString().padStart(decimals, "0").replace(/0+$/, "");
  const out = frac ? `${whole}.${frac}` : `${whole}`;
  return neg ? `-${out}` : out;
}

export function potToPlanck(pot: string, decimals = POT_DECIMALS): bigint {
  const trimmed = pot.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) throw new Error(`invalid POT amount: "${pot}"`);
  const [whole, frac = ""] = trimmed.split(".");
  const fracPadded = (frac + "0".repeat(decimals)).slice(0, decimals);
  return BigInt(whole ?? "0") * 10n ** BigInt(decimals) + BigInt(fracPadded || "0");
}

export function formatPot(raw: bigint): string {
  return `${planckToPot(raw)} POT`;
}

export function truncateAddress(addr: string, head = 5, tail = 5): string {
  if (!addr) return "—";
  return addr.length <= head + tail + 1 ? addr : `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}
