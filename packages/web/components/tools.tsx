"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Blocks,
  Receipt,
  ListChecks,
  Coins,
  ArrowUpRight,
  TriangleAlert,
  CircleCheck,
  Loader2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPot, planckToPot, truncateAddress } from "@/lib/format";

type Tone = "default" | "success" | "pending" | "destructive";

const toneRing: Record<Tone, string> = {
  default: "border-border",
  success: "border-success/45",
  pending: "border-pending/45",
  destructive: "border-destructive/45",
};

const toneIcon: Record<Tone, string> = {
  default: "bg-primary/12 text-primary",
  success: "bg-success/15 text-success",
  pending: "bg-pending/15 text-pending",
  destructive: "bg-destructive/15 text-destructive",
};

/** Premium tool-result surface: pointer-tracked spotlight + motion entrance, all on tokens. */
function ToolCard({
  icon: Icon,
  label,
  tone = "default",
  children,
}: {
  icon: LucideIcon;
  label: string;
  tone?: Tone;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        ref={ref}
        onMouseMove={onMouseMove}
        className={cn(
          "group relative overflow-hidden rounded-2xl border bg-card p-4 transition-colors",
          "hover:border-border-hover",
          toneRing[tone],
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(220px circle at var(--mx, 50%) var(--my, 0%), var(--accent-soft), transparent 70%)",
          }}
        />
        <div className="relative">
          <div className="mb-3 flex items-center gap-2.5">
            <span className={cn("flex size-7 items-center justify-center rounded-lg", toneIcon[tone])}>
              <Icon className="size-4" />
            </span>
            <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
          </div>
          {children}
        </div>
      </div>
    </motion.div>
  );
}

const Mono = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn("font-mono text-foreground", className)}>{children}</span>
);

const Row = ({ k, v, strong }: { k: string; v: React.ReactNode; strong?: boolean }) => (
  <div className="flex items-center justify-between gap-4 py-1 text-sm">
    <span className="text-muted-foreground">{k}</span>
    <span className={strong ? "font-medium text-foreground" : "text-foreground"}>{v}</span>
  </div>
);

export function SkeletonCard({ label }: { label: string }) {
  return (
    <ToolCard icon={Loader2} label={label}>
      <div className="space-y-2.5">
        <div className="h-3.5 w-2/3 rounded bg-secondary animate-[shimmer_1.6s_ease-in-out_infinite]" />
        <div className="h-3.5 w-1/2 rounded bg-secondary animate-[shimmer_1.6s_ease-in-out_infinite]" />
        <div className="h-3.5 w-3/5 rounded bg-secondary animate-[shimmer_1.6s_ease-in-out_infinite]" />
      </div>
    </ToolCard>
  );
}

export function ErrorCard({ message }: { message: string }) {
  return (
    <ToolCard icon={TriangleAlert} label="Error" tone="destructive">
      <p className="font-mono text-sm leading-relaxed text-destructive">{message}</p>
    </ToolCard>
  );
}

export function BalanceCard({ data }: { data: Record<string, unknown> }) {
  const free = BigInt((data.free as string) ?? "0");
  const reserved = BigInt((data.reserved as string) ?? "0");
  const total = BigInt((data.total as string) ?? "0");
  return (
    <ToolCard icon={Wallet} label="Balance">
      <div className="mb-3 font-mono text-xs text-muted-foreground">
        {truncateAddress(String(data.address ?? ""))}
      </div>
      <div className="mb-3 font-mono text-2xl font-semibold tracking-tight text-foreground">
        {formatPot(total)}
      </div>
      <div className="rounded-xl border border-border bg-background/40 px-3 py-1.5">
        <Row k="Free" v={<Mono>{planckToPot(free)}</Mono>} />
        <Row k="Reserved" v={<Mono>{planckToPot(reserved)}</Mono>} />
      </div>
    </ToolCard>
  );
}

export function BlockInfoCard({ data }: { data: Record<string, unknown> }) {
  const ts = Number(data.timestamp ?? 0);
  return (
    <ToolCard icon={Blocks} label="Block">
      <Row k="Number" v={<Mono className="text-base">#{String(data.number)}</Mono>} strong />
      <Row k="Hash" v={<Mono>{truncateAddress(String(data.hash), 8, 6)}</Mono>} />
      <Row k="Time" v={ts ? new Date(ts).toLocaleString() : "—"} />
      <Row k="Extrinsics" v={<Mono>{String(data.extrinsics)}</Mono>} />
    </ToolCard>
  );
}

export function FeeCard({ data }: { data: Record<string, unknown> }) {
  return (
    <ToolCard icon={Receipt} label="Estimated fee">
      <div className="font-mono text-xl font-semibold text-foreground">
        {String(data.formatted ?? data.feePot)}
      </div>
    </ToolCard>
  );
}

export function TaskListCard({ data }: { data: Record<string, unknown> }) {
  const tasks = (data.tasks as Array<Record<string, unknown>>) ?? [];
  return (
    <ToolCard icon={ListChecks} label={`Tasks (${tasks.length})`}>
      {tasks.length === 0 ? (
        <p className="text-sm text-fg-muted">No tasks yet.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((t, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm">
              {t.completed ? (
                <CircleCheck className="size-4 shrink-0 text-success" />
              ) : (
                <Loader2 className="size-4 shrink-0 text-pending" />
              )}
              <Mono className="text-muted-foreground">#{String(t.id)}</Mono>
              <span className="text-foreground">{String(t.description)}</span>
            </li>
          ))}
        </ul>
      )}
    </ToolCard>
  );
}

export function GenericResultCard({ label, data }: { label: string; data: Record<string, unknown> }) {
  const renderVal = (v: unknown): React.ReactNode => {
    if (v === null || v === undefined) return <span className="text-fg-muted">—</span>;
    if (typeof v === "string") {
      const isMono = v.startsWith("0x") || (v.length > 44 && v.startsWith("5"));
      return isMono ? (
        <Mono>{v.length > 20 ? truncateAddress(v, 8, 6) : v}</Mono>
      ) : (
        <span className="text-foreground">{v}</span>
      );
    }
    if (typeof v === "number" || typeof v === "boolean") {
      return <span className="font-mono text-foreground">{String(v)}</span>;
    }
    if (Array.isArray(v)) {
      return (
        <span className="text-muted-foreground">
          {v.length} item{v.length === 1 ? "" : "s"}
        </span>
      );
    }
    if (typeof v === "object") {
      return (
        <div className="text-right">
          {Object.entries(v as Record<string, unknown>).map(([sk, sv]) => (
            <div key={sk} className="text-xs text-muted-foreground">
              {sk}: <span className="text-foreground">{typeof sv === "object" ? JSON.stringify(sv) : String(sv)}</span>
            </div>
          ))}
        </div>
      );
    }
    return <span>{String(v)}</span>;
  };
  return (
    <ToolCard icon={Sparkles} label={label}>
      <div className="divide-y divide-border/60">
        {Object.entries(data).map(([k, v]) => (
          <Row key={k} k={k} v={renderVal(v)} />
        ))}
      </div>
    </ToolCard>
  );
}

export function TokenCard({ data }: { data: Record<string, unknown> }) {
  return (
    <ToolCard icon={Coins} label="Token">
      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-lg font-medium text-foreground">{String(data.name)}</span>
        <Mono className="text-muted-foreground">{String(data.symbol)}</Mono>
      </div>
      <Row k="Asset id" v={<Mono>#{String(data.assetId)}</Mono>} />
      <Row k="Decimals" v={<Mono>{String(data.decimals)}</Mono>} />
      <Row k="Supply" v={<Mono>{String(data.supplyFormatted ?? data.supply)}</Mono>} strong />
      <Row k="Owner" v={<Mono>{truncateAddress(String(data.owner ?? ""))}</Mono>} />
    </ToolCard>
  );
}

export function TokenListCard({ data }: { data: Record<string, unknown> }) {
  const tokens = (data.tokens as Array<Record<string, unknown>>) ?? [];
  return (
    <ToolCard icon={Coins} label={`Tokens (${tokens.length})`}>
      {tokens.length === 0 ? (
        <p className="text-sm text-fg-muted">No tokens owned.</p>
      ) : (
        <ul className="space-y-1.5">
          {tokens.map((t, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <Mono className="text-muted-foreground">#{String(t.assetId)}</Mono>
              <span className="font-medium text-foreground">{String(t.symbol)}</span>
              <span className="text-muted-foreground">{String(t.name)}</span>
              <span className="ml-auto font-mono text-muted-foreground">{String(t.supplyFormatted)}</span>
            </li>
          ))}
        </ul>
      )}
    </ToolCard>
  );
}

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
  if (output) {
    return (
      <ToolCard icon={CircleCheck} label="Transfer confirmed" tone="success">
        <Row k="To" v={<Mono>{truncateAddress(input.to)}</Mono>} />
        <Row k="Amount" v={<Mono>{input.amount} POT</Mono>} strong />
        <Row k="Tx" v={<Mono>{truncateAddress(output.txHash, 8, 6)}</Mono>} />
        <Row k="Block" v={<Mono>{truncateAddress(output.blockHash, 8, 6)}</Mono>} />
      </ToolCard>
    );
  }
  return (
    <ToolCard icon={ArrowUpRight} label="Transfer preview" tone={error ? "destructive" : "pending"}>
      <Row k="To" v={<Mono>{truncateAddress(input.to)}</Mono>} />
      <Row k="Amount" v={<Mono className="text-base">{input.amount} POT</Mono>} strong />
      {error && <p className="mt-2 font-mono text-sm text-destructive">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onSign}
          disabled={!canSign || signing}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-[transform,filter] hover:-translate-y-px hover:brightness-110 focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-40"
        >
          {signing && <Loader2 className="size-3.5 animate-spin" />}
          {signing ? "Signing…" : canSign ? "Sign & Send" : "Connect wallet to sign"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={signing}
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-border-hover hover:text-foreground disabled:opacity-40"
        >
          Cancel
        </button>
      </div>
    </ToolCard>
  );
}
