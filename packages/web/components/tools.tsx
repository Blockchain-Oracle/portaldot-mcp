"use client";

import * as React from "react";
import { Copy, Check, ExternalLink, ArrowDown, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { planckToPot, truncateAddress } from "@/lib/format";
import { useWallet } from "@/lib/wallet";
import { useChainPulse } from "@/lib/chain-pulse";
import { ReceiptCard, ReceiptStamp, type ReceiptTone } from "@/components/cards/receipt-card";
import { Identicon } from "@/components/cards/identicon";
import { AddressQR } from "@/components/cards/address-qr";

/* ───────────────────────── helpers ───────────────────────── */

const SUBSCAN = "https://portaldot.subscan.io";

const Mono = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn("font-mono tabular-nums text-foreground", className)}>{children}</span>
);

const Row = ({ k, v, strong }: { k: string; v: React.ReactNode; strong?: boolean }) => (
  <div className="flex items-center justify-between gap-4 py-1 text-sm">
    <span className="text-fg-muted">{k}</span>
    <span className={strong ? "font-medium text-foreground" : "text-foreground"}>{v}</span>
  </div>
);

const Display = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span
    className={cn("tabular-nums tracking-tight text-foreground", className)}
    style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
  >
    {children}
  </span>
);

function useCopy() {
  const [copied, setCopied] = React.useState(false);
  const copy = React.useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* noop */
    }
  }, []);
  return { copied, copy };
}

/** Animate a bigint from 0n → target with ease-out cubic over `durMs`. */
function useRampBigInt(target: bigint, durMs = 700): bigint {
  const [v, setV] = React.useState<bigint>(target);
  const targetKey = String(target);
  React.useEffect(() => {
    let raf = 0;
    const start = performance.now();
    function step(t: number) {
      const k = Math.min(1, (t - start) / durMs);
      const eased = 1 - Math.pow(1 - k, 3);
      // scale by 1e9 to keep precision through the bigint multiply
      const SCALE = 1_000_000_000n;
      const num = (target * BigInt(Math.round(eased * 1e9))) / SCALE;
      setV(num);
      if (k < 1) raf = requestAnimationFrame(step);
    }
    setV(0n);
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [targetKey, durMs, target]);
  return v;
}

function CopyChip({ value, label }: { value: string; label?: string }) {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() => copy(value)}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[12px] text-fg-secondary transition-colors hover:bg-surface-2 hover:text-foreground"
      title={value}
    >
      <span className="tabular-nums">{label ?? truncateAddress(value, 6, 6)}</span>
      {copied ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
    </button>
  );
}

function ExplorerLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-[0.18em] text-telemetry transition-colors hover:text-foreground"
    >
      {label}
      <ExternalLink className="size-3" />
    </a>
  );
}

/** Raw-SVG sparkline driven by the chain-pulse buffer. */
function Sparkline({
  data,
  w = 88,
  h = 22,
  target = 6000,
}: {
  data: number[];
  w?: number;
  h?: number;
  /** Block target in ms (6s on Portaldot). Bars deviating >17% paint cyan. */
  target?: number;
}) {
  if (data.length < 2) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
        gathering signal
        <Loader2 className="size-3 animate-spin" />
      </span>
    );
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(max - min, 1);
  const path = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 2) - 1;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const lastDeviation = Math.abs(data[data.length - 1] - target) / target;
  const stroke = lastDeviation > 0.17 ? "var(--telemetry)" : "var(--fg-muted)";
  return (
    <svg width={w} height={h} aria-hidden className="overflow-visible">
      <path d={path} stroke={stroke} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
    </svg>
  );
}

/* ───────────────────────── Skeleton + Error ───────────────────────── */

export function SkeletonCard({ label }: { label: string }) {
  return (
    <ReceiptCard toolName={label} metaRight="FETCHING" tone="pending" noEntrance>
      <div className="space-y-3 py-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="relative h-3 overflow-hidden rounded-sm bg-surface-2"
            style={{ width: `${100 - i * 14}%` }}
          >
            <div
              className="absolute inset-y-0 w-1/3 animate-[pulse-soft_1.4s_ease-in-out_infinite]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(0.78 0.13 220 / 50%), transparent)",
                animationDelay: `${i * 160}ms`,
              }}
            />
          </div>
        ))}
      </div>
    </ReceiptCard>
  );
}

export function ErrorCard({ message }: { message: string }) {
  return (
    <ReceiptCard
      toolName="error"
      metaRight="VOID"
      tone="destructive"
      stamp={<ReceiptStamp label="VOID" tone="destructive" rotate={-8} />}
    >
      <p className="font-mono text-[13px] leading-relaxed text-destructive">{message}</p>
    </ReceiptCard>
  );
}

/* ───────────────────────── Balance ───────────────────────── */

export function BalanceCard({ data }: { data: Record<string, unknown> }) {
  const address = String(data.address ?? "");
  const free = BigInt((data.free as string) ?? "0");
  const reserved = BigInt((data.reserved as string) ?? "0");
  const total = BigInt((data.total as string) ?? "0");
  const ramped = useRampBigInt(total);
  const { copied, copy } = useCopy();

  return (
    <ReceiptCard toolName="portaldot_get_balance" tone="default">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-2">
            <Identicon address={address} size={28} />
            <button
              type="button"
              onClick={() => copy(address)}
              className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 font-mono text-[12px] text-fg-secondary transition-colors hover:bg-surface-2 hover:text-foreground"
              title={address}
            >
              {truncateAddress(address, 6, 6)}
              {copied ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
            </button>
          </div>
          <div className="leading-none">
            <Display className="text-[34px] sm:text-[44px]">{planckToPot(ramped)}</Display>{" "}
            <span className="font-mono text-sm text-fg-muted">POT</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-4 rounded-lg border border-border bg-surface-2/40 px-3 py-2">
            <Row k="Free" v={<Mono>{planckToPot(free)}</Mono>} />
            <Row k="Reserved" v={<Mono>{planckToPot(reserved)}</Mono>} />
          </div>
        </div>
        {address && (
          <div className="self-start sm:self-auto">
            <AddressQR value={address} size={84} caption="scan to send" />
          </div>
        )}
      </div>
    </ReceiptCard>
  );
}

/* ───────────────────────── Block info ───────────────────────── */

export function BlockInfoCard({ data }: { data: Record<string, unknown> }) {
  const pulse = useChainPulse();
  const ts = Number(data.timestamp ?? 0);
  const number = String(data.number);
  const hash = String(data.hash ?? "");
  const extrinsics = String(data.extrinsics ?? "0");

  return (
    <ReceiptCard
      toolName="portaldot_get_block_info"
      metaRight={
        <span className="inline-flex items-center gap-2">
          {pulse.latencyMs !== null && (
            <span className="font-mono text-[10px] tabular-nums">{pulse.latencyMs}ms</span>
          )}
          <Sparkline data={pulse.intervals} />
        </span>
      }
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="mb-1 text-[10px] font-mono uppercase tracking-[0.18em] text-fg-muted">block</div>
          <Display className="text-[36px] leading-none">#{Number(number).toLocaleString()}</Display>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-fg-muted">extrinsics</div>
          <Display className="text-[20px] leading-none">{extrinsics}</Display>
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <Row k="Hash" v={<CopyChip value={hash} />} />
        <Row k="Time" v={<Mono className="text-[12px]">{ts ? new Date(ts).toLocaleString() : "—"}</Mono>} />
      </div>
    </ReceiptCard>
  );
}

/* ───────────────────────── Fee ───────────────────────── */

export function FeeCard({ data }: { data: Record<string, unknown> }) {
  return (
    <ReceiptCard toolName="portaldot_estimate_fee">
      <div className="flex items-baseline gap-2">
        <Display className="text-[28px]">{String(data.formatted ?? data.feePot)}</Display>
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-fg-muted">est. fee</span>
      </div>
    </ReceiptCard>
  );
}

/* ───────────────────────── Tasks ───────────────────────── */

export function TaskListCard({ data }: { data: Record<string, unknown> }) {
  const tasks = (data.tasks as Array<Record<string, unknown>>) ?? [];
  return (
    <ReceiptCard toolName="portaldot_list_tasks" metaRight={`${tasks.length} ITEM${tasks.length === 1 ? "" : "S"}`}>
      {tasks.length === 0 ? (
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
          —— no tasks recorded ——
        </p>
      ) : (
        <ul className="divide-y divide-border/70">
          {tasks.map((t, i) => (
            <li key={i} className="flex items-center gap-3 py-1.5 text-sm">
              <Mono className="w-12 text-fg-muted">#{String(t.id)}</Mono>
              <span className="flex-1 text-foreground">{String(t.description)}</span>
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em]",
                  t.completed
                    ? "border-success/40 text-success"
                    : "border-pending/40 text-pending",
                )}
              >
                {t.completed ? "done" : "open"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </ReceiptCard>
  );
}

/* ───────────────────────── Tokens ───────────────────────── */

export function TokenCard({ data }: { data: Record<string, unknown> }) {
  const owner = String(data.owner ?? "");
  return (
    <ReceiptCard
      toolName="portaldot_token_info"
      metaRight={<span>ASSET #{String(data.assetId)}</span>}
    >
      <div className="mb-3 flex items-baseline gap-2">
        <Display className="text-[24px]">{String(data.name)}</Display>
        <Mono className="text-fg-muted">{String(data.symbol)}</Mono>
      </div>
      <Row k="Decimals" v={<Mono>{String(data.decimals)}</Mono>} />
      <Row k="Supply" v={<Mono>{String(data.supplyFormatted ?? data.supply)}</Mono>} strong />
      <Row
        k="Owner"
        v={
          <span className="inline-flex items-center gap-1.5">
            {owner && <Identicon address={owner} size={16} />}
            <CopyChip value={owner} />
          </span>
        }
      />
    </ReceiptCard>
  );
}

export function TokenListCard({ data }: { data: Record<string, unknown> }) {
  const tokens = (data.tokens as Array<Record<string, unknown>>) ?? [];
  return (
    <ReceiptCard
      toolName="portaldot_my_tokens"
      metaRight={`${tokens.length} TOKEN${tokens.length === 1 ? "" : "S"}`}
    >
      {tokens.length === 0 ? (
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
          —— no tokens owned ——
        </p>
      ) : (
        <ul className="divide-y divide-border/70">
          {tokens.map((t, i) => (
            <li key={i} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-1.5 text-sm">
              <Mono className="text-fg-muted">#{String(t.assetId)}</Mono>
              <span>
                <span className="font-medium text-foreground">{String(t.symbol)}</span>{" "}
                <span className="text-fg-muted">· {String(t.name)}</span>
              </span>
              <Mono className="text-right text-fg-secondary">{String(t.supplyFormatted)}</Mono>
            </li>
          ))}
        </ul>
      )}
    </ReceiptCard>
  );
}

/* ───────────────────────── Chain info ───────────────────────── */

export function ChainInfoCard({ data }: { data: Record<string, unknown> }) {
  const token = String(data.token ?? "POT");
  const decimals = String(data.decimals ?? 14);
  const ss58 = String(data.ss58Prefix ?? 42);
  const issuance = String(data.totalIssuance ?? "—");
  const era = data.currentEra !== null && data.currentEra !== undefined ? String(data.currentEra) : "—";
  const bestBlock = Number(data.bestBlock ?? 0);
  const validators = Number(data.validatorCount ?? 0);

  return (
    <ReceiptCard toolName="portaldot_chain_info" metaRight="NETWORK SNAPSHOT">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MetricTile label="Best block" value={`#${bestBlock.toLocaleString()}`} large />
        <MetricTile label="Era" value={era} />
        <MetricTile label="Validators" value={String(validators)} />
        <MetricTile label="Total issuance" value={issuance} large />
        <MetricTile label="Token" value={token} />
        <MetricTile label="ss58 · dec" value={`${ss58} · ${decimals}`} />
      </div>
    </ReceiptCard>
  );
}

function MetricTile({ label, value, large }: { label: string; value: string; large?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2/40 px-3 py-2">
      <div className="text-[9px] font-mono uppercase tracking-[0.22em] text-fg-muted">{label}</div>
      <div
        className={cn(
          "mt-0.5 truncate text-foreground",
          large ? "text-[18px]" : "text-[15px]",
        )}
        style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
      >
        {value}
      </div>
    </div>
  );
}

/* ───────────────────────── Validators ───────────────────────── */

export function ValidatorsCard({ data }: { data: Record<string, unknown> }) {
  const all = ((data.validators as string[]) ?? []).filter(Boolean);
  const count = Number(data.count ?? all.length);
  const top = all.slice(0, 10);

  return (
    <ReceiptCard
      toolName="portaldot_validators"
      metaRight={`${count} ACTIVE`}
    >
      {top.length === 0 ? (
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
          —— no active set ——
        </p>
      ) : (
        <>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-fg-muted">
              Top {top.length}
            </div>
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-fg-muted">
              of {count}
            </div>
          </div>
          <ul className="divide-y divide-border/70">
            {top.map((addr, i) => (
              <li key={addr} className="flex items-center gap-2.5 py-1.5 text-sm">
                <Mono className="w-6 text-right text-fg-muted">{i + 1}</Mono>
                <Identicon address={addr} size={18} />
                <CopyChip value={addr} />
                <ExplorerLink href={`${SUBSCAN}/account/${addr}`} label="" />
              </li>
            ))}
          </ul>
          {count > top.length && (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
              + {count - top.length} more
            </p>
          )}
        </>
      )}
    </ReceiptCard>
  );
}

/* ───────────────────────── Staking ───────────────────────── */

export function StakingInfoCard({ data }: { data: Record<string, unknown> }) {
  const address = String(data.address ?? "");
  const bonded = Boolean(data.bonded);
  const active = String(data.activePot ?? "0");
  const total = String(data.totalPot ?? "0");
  const nominating = ((data.nominating as string[]) ?? []).filter(Boolean);

  return (
    <ReceiptCard
      toolName="portaldot_staking_info"
      tone={bonded ? "success" : "default"}
      metaRight={bonded ? "BONDED" : "NOT BONDED"}
    >
      <div className="mb-3 flex items-center gap-2">
        <Identicon address={address} size={20} />
        <CopyChip value={address} />
      </div>

      {bonded ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-surface-2/40 px-3 py-2">
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-fg-muted">Active</div>
            <div className="leading-none">
              <Display className="text-[22px]">{active}</Display>{" "}
              <span className="font-mono text-[11px] text-fg-muted">POT</span>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface-2/40 px-3 py-2">
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-fg-muted">Total</div>
            <div className="leading-none">
              <Display className="text-[22px]">{total}</Display>{" "}
              <span className="font-mono text-[11px] text-fg-muted">POT</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
          —— account is not bonded ——
        </p>
      )}

      {nominating.length > 0 && (
        <div className="mt-4">
          <div className="mb-1.5 text-[10px] font-mono uppercase tracking-[0.22em] text-fg-muted">
            Nominating {nominating.length}
          </div>
          <ul className="flex flex-wrap gap-1.5">
            {nominating.slice(0, 8).map((addr) => (
              <li
                key={addr}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2/40 px-2 py-0.5 text-[11px]"
              >
                <Identicon address={addr} size={12} />
                <Mono className="text-fg-secondary">{truncateAddress(addr, 4, 4)}</Mono>
              </li>
            ))}
            {nominating.length > 8 && (
              <li className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
                + {nominating.length - 8}
              </li>
            )}
          </ul>
        </div>
      )}
    </ReceiptCard>
  );
}

/* ───────────────────────── Identity ───────────────────────── */

export function IdentityCard({ data }: { data: Record<string, unknown> }) {
  const address = String(data.address ?? "");
  const identity = data.identity as { display?: string | null; email?: string | null; web?: string | null; twitter?: string | null } | null;
  const registered = Boolean(identity);

  return (
    <ReceiptCard
      toolName="portaldot_resolve_address"
      metaRight={registered ? "REGISTERED" : "UNREGISTERED"}
      tone={registered ? "default" : "pending"}
    >
      <div className="flex items-center gap-3">
        <Identicon address={address} size={36} halo={registered} />
        <div className="min-w-0 flex-1">
          {registered && identity?.display ? (
            <>
              <Display className="block truncate text-[22px] leading-tight">
                {identity.display}
              </Display>
              <div className="mt-0.5">
                <CopyChip value={address} />
              </div>
            </>
          ) : (
            <>
              <div className="text-[14px] font-medium text-fg-secondary">No display name set</div>
              <div className="mt-0.5">
                <CopyChip value={address} />
              </div>
            </>
          )}
        </div>
        {registered && (
          <span className="rounded-full border border-success/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-success">
            judged
          </span>
        )}
      </div>

      {registered && identity && (
        <div className="mt-4 space-y-1.5 text-sm">
          {identity.email && <Row k="Email" v={<Mono className="text-fg-secondary">{identity.email}</Mono>} />}
          {identity.web && (
            <Row
              k="Web"
              v={
                <a
                  href={identity.web.startsWith("http") ? identity.web : `https://${identity.web}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-telemetry transition-colors hover:text-foreground"
                >
                  {identity.web}
                </a>
              }
            />
          )}
          {identity.twitter && <Row k="Twitter" v={<Mono className="text-fg-secondary">{identity.twitter}</Mono>} />}
        </div>
      )}
    </ReceiptCard>
  );
}

/* ───────────────────────── Bounties ───────────────────────── */

export function BountiesCard({ data }: { data: Record<string, unknown> }) {
  const count = Number(data.count ?? 0);
  const bounties = ((data.bounties as Array<Record<string, unknown>>) ?? []);
  return (
    <ReceiptCard
      toolName="portaldot_list_bounties"
      metaRight={`${count} BOUNT${count === 1 ? "Y" : "IES"}`}
    >
      {bounties.length === 0 ? (
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
          —— treasury currently has no open bounties ——
        </p>
      ) : (
        <ul className="divide-y divide-border/70">
          {bounties.map((b) => (
            <li key={String(b.index)} className="flex items-start gap-3 py-2">
              <Mono className="mt-0.5 w-12 shrink-0 text-fg-muted">#{String(b.index)}</Mono>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[13px] text-foreground">{String(b.description) || "—"}</p>
              </div>
              <Display className="shrink-0 text-[15px] text-foreground">
                {String(b.valuePot)}
                <span className="ml-1 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
                  POT
                </span>
              </Display>
            </li>
          ))}
        </ul>
      )}
    </ReceiptCard>
  );
}

/* ───────────────────────── Generic ───────────────────────── */

const isSs58 = (s: string) => /^[1-9A-HJ-NP-Za-km-z]{45,}$/.test(s) && s.startsWith("5");
const isHex = (s: string) => /^0x[0-9a-fA-F]+$/.test(s);

export function GenericResultCard({ label, data }: { label: string; data: Record<string, unknown> }) {
  const renderVal = (v: unknown): React.ReactNode => {
    if (v === null || v === undefined) return <span className="text-fg-muted">—</span>;
    if (typeof v === "string") {
      if (isSs58(v)) {
        return (
          <span className="inline-flex items-center gap-1.5">
            <Identicon address={v} size={14} />
            <CopyChip value={v} />
          </span>
        );
      }
      if (isHex(v) && v.length > 20) return <CopyChip value={v} />;
      return <span className="text-foreground">{v}</span>;
    }
    if (typeof v === "number" || typeof v === "boolean") {
      return <Mono>{String(v)}</Mono>;
    }
    if (Array.isArray(v)) {
      return (
        <span className="text-fg-muted">
          {v.length} item{v.length === 1 ? "" : "s"}
        </span>
      );
    }
    if (typeof v === "object") {
      return (
        <div className="text-right">
          {Object.entries(v as Record<string, unknown>).map(([sk, sv]) => (
            <div key={sk} className="text-xs text-fg-muted">
              {sk}:{" "}
              <span className="text-foreground">
                {typeof sv === "object" ? JSON.stringify(sv) : String(sv)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return <span>{String(v)}</span>;
  };
  return (
    <ReceiptCard toolName={label}>
      <div className="divide-y divide-border/60">
        {Object.entries(data).map(([k, v]) => (
          <Row key={k} k={k} v={renderVal(v)} />
        ))}
      </div>
    </ReceiptCard>
  );
}

/* ───────────────────────── Transfer (flagship) ───────────────────────── */

export interface TransferInput {
  to: string;
  amount: string;
}
export interface TransferOutput {
  txHash: string;
  blockHash: string;
}

export function TransferCard({
  input,
  output,
  signing,
  error,
  onSign,
  onCancel,
  canSign,
}: {
  input: TransferInput;
  output?: TransferOutput;
  signing?: boolean;
  error?: string;
  onSign?: () => void;
  onCancel?: () => void;
  canSign: boolean;
}) {
  const { account } = useWallet();
  const from = account?.address ?? "";
  const confirmed = Boolean(output);

  const tone: ReceiptTone = confirmed ? "success" : error ? "destructive" : "pending";

  return (
    <ReceiptCard
      toolName="portaldot_transfer"
      tone={tone}
      metaRight={
        confirmed
          ? "FINALIZED"
          : error
            ? "VOID"
            : signing
              ? "SIGNING"
              : "AWAITING SIGNATURE"
      }
      stamp={
        confirmed ? (
          <ReceiptStamp label="PAID" tone="success" />
        ) : error ? (
          <ReceiptStamp label="VOID" tone="destructive" rotate={-8} />
        ) : null
      }
    >
      <div className="space-y-4">
        {/* From → To  (QR floats right on sm+, drops below on mobile) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">from</span>
              <span className="inline-flex items-center gap-1.5">
                {from && <Identicon address={from} size={16} />}
                <CopyChip value={from} />
              </span>
            </div>
            <div className="pl-1 text-fg-muted">
              <ArrowDown className="size-3.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">to</span>
              <span className="inline-flex items-center gap-1.5">
                <Identicon address={input.to} size={16} />
                <CopyChip value={input.to} />
              </span>
            </div>
          </div>
          {!confirmed && input.to && (
            <div className="self-start sm:self-center">
              <AddressQR value={input.to} size={56} />
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="rounded-lg border border-border bg-surface-2/40 px-3 py-2.5">
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-fg-muted">amount</div>
          <div className="mt-0.5 flex items-baseline gap-2">
            <Display className="text-[36px] leading-none">{input.amount}</Display>
            <Mono className="text-sm text-fg-muted">POT</Mono>
          </div>
        </div>

        {confirmed && output && (
          <div className="space-y-1 rounded-lg border border-success/30 bg-success/5 px-3 py-2">
            <Row
              k="Tx"
              v={
                <span className="inline-flex items-center gap-2">
                  <CopyChip value={output.txHash} />
                  <ExplorerLink href={`${SUBSCAN}/extrinsic/${output.txHash}`} label="Subscan" />
                </span>
              }
            />
            <Row
              k="Block"
              v={
                <span className="inline-flex items-center gap-2">
                  <CopyChip value={output.blockHash} />
                  <ExplorerLink href={`${SUBSCAN}/block/${output.blockHash}`} label="Subscan" />
                </span>
              }
            />
          </div>
        )}

        {error && <p className="font-mono text-[12px] text-destructive">{error}</p>}

        {!confirmed && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onSign}
              disabled={!canSign || signing}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-[0_10px_30px_-12px_oklch(0.66_0.22_288_/_70%)] transition-[transform,filter] hover:-translate-y-px hover:brightness-110 focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              {signing ? <Loader2 className="size-3.5 animate-spin" /> : <ShieldCheck className="size-3.5" />}
              {signing ? "Signing…" : canSign ? "Authorize" : "Connect wallet"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={signing}
              className="rounded-full border border-border px-4 py-1.5 text-sm text-fg-muted transition-colors hover:border-border-strong hover:text-foreground disabled:opacity-40"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </ReceiptCard>
  );
}
