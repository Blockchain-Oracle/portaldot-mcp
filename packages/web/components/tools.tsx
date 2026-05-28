"use client";

import { formatPot, planckToPot, truncateAddress } from "@/lib/format";

function Card({
  icon,
  label,
  tone = "default",
  children,
}: {
  icon: string;
  label: string;
  tone?: "default" | "success" | "pending" | "destructive";
  children: React.ReactNode;
}) {
  const toneBorder =
    tone === "success"
      ? "border-success/50"
      : tone === "pending"
        ? "border-pending/50"
        : tone === "destructive"
          ? "border-destructive/50"
          : "border-border hover:border-border-hover";
  return (
    <div className={`rounded-card border ${toneBorder} bg-surface p-4 transition-colors`}>
      <div className="mb-3 flex items-center gap-2 text-[13px] text-fg-secondary">
        <span aria-hidden>{icon}</span>
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}

const Mono = ({ children }: { children: React.ReactNode }) => (
  <span className="font-mono text-fg">{children}</span>
);

const Row = ({ k, v, strong }: { k: string; v: React.ReactNode; strong?: boolean }) => (
  <div className="flex items-center justify-between py-0.5 text-sm">
    <span className="text-fg-secondary">{k}</span>
    <span className={strong ? "font-medium text-fg" : "text-fg"}>{v}</span>
  </div>
);

export function SkeletonCard({ label }: { label: string }) {
  return (
    <Card icon="•" label={label}>
      <div className="space-y-2">
        <div className="h-3 w-2/3 animate-pulse rounded bg-surface-2" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-surface-2" />
      </div>
    </Card>
  );
}

export function ErrorCard({ message }: { message: string }) {
  return (
    <Card icon="⚠" label="Error" tone="destructive">
      <p className="font-mono text-sm text-destructive">{message}</p>
    </Card>
  );
}

export function BalanceCard({ data }: { data: Record<string, unknown> }) {
  const free = BigInt((data.free as string) ?? "0");
  const reserved = BigInt((data.reserved as string) ?? "0");
  const total = BigInt((data.total as string) ?? "0");
  return (
    <Card icon="◆" label="Balance">
      <div className="mb-2">
        <Mono>{truncateAddress(String(data.address ?? ""))}</Mono>
      </div>
      <Row k="Free" v={<Mono>{planckToPot(free)}</Mono>} />
      <Row k="Reserved" v={<Mono>{planckToPot(reserved)}</Mono>} />
      <div className="my-2 h-px bg-border" />
      <Row k="Total" v={<Mono>{formatPot(total)}</Mono>} strong />
    </Card>
  );
}

export function BlockInfoCard({ data }: { data: Record<string, unknown> }) {
  const ts = Number(data.timestamp ?? 0);
  return (
    <Card icon="▦" label="Block">
      <Row k="Number" v={<Mono>#{String(data.number)}</Mono>} strong />
      <Row k="Hash" v={<Mono>{truncateAddress(String(data.hash), 8, 6)}</Mono>} />
      <Row k="Time" v={ts ? new Date(ts).toLocaleString() : "—"} />
      <Row k="Extrinsics" v={<Mono>{String(data.extrinsics)}</Mono>} />
    </Card>
  );
}

export function FeeCard({ data }: { data: Record<string, unknown> }) {
  return (
    <Card icon="≈" label="Estimated fee">
      <Row k="Fee" v={<Mono>{String(data.formatted ?? data.feePot)}</Mono>} strong />
    </Card>
  );
}

export function TaskListCard({ data }: { data: Record<string, unknown> }) {
  const tasks = (data.tasks as Array<Record<string, unknown>>) ?? [];
  return (
    <Card icon="☰" label={`Tasks (${tasks.length})`}>
      {tasks.length === 0 ? (
        <p className="text-sm text-fg-muted">No tasks yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {tasks.map((t, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className={t.completed ? "text-success" : "text-pending"}>
                {t.completed ? "✓" : "⏳"}
              </span>
              <Mono>#{String(t.id)}</Mono>
              <span className="text-fg">{String(t.description)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function GenericResultCard({ label, data }: { label: string; data: Record<string, unknown> }) {
  const renderVal = (v: unknown): React.ReactNode => {
    if (v === null || v === undefined) return <span className="text-fg-muted">—</span>;
    if (typeof v === "string") {
      const isMono = v.startsWith("0x") || (v.length > 44 && v.startsWith("5"));
      return isMono ? <Mono>{v.length > 20 ? truncateAddress(v, 8, 6) : v}</Mono> : <span className="text-fg">{v}</span>;
    }
    if (typeof v === "number" || typeof v === "boolean") {
      return <span className="font-mono text-fg">{String(v)}</span>;
    }
    if (Array.isArray(v)) {
      return <span className="text-fg-secondary">{v.length} item{v.length === 1 ? "" : "s"}</span>;
    }
    if (typeof v === "object") {
      return (
        <div className="text-right">
          {Object.entries(v as Record<string, unknown>).map(([sk, sv]) => (
            <div key={sk} className="text-xs text-fg-secondary">
              {sk}: <span className="text-fg">{typeof sv === "object" ? JSON.stringify(sv) : String(sv)}</span>
            </div>
          ))}
        </div>
      );
    }
    return <span>{String(v)}</span>;
  };
  return (
    <Card icon="◷" label={label}>
      {Object.entries(data).map(([k, v]) => (
        <Row key={k} k={k} v={renderVal(v)} />
      ))}
    </Card>
  );
}

export function TokenCard({ data }: { data: Record<string, unknown> }) {
  return (
    <Card icon="🪙" label="Token">
      <div className="mb-2 flex items-baseline gap-2">
        <span className="font-medium text-fg">{String(data.name)}</span>
        <Mono>{String(data.symbol)}</Mono>
      </div>
      <Row k="Asset id" v={<Mono>#{String(data.assetId)}</Mono>} />
      <Row k="Decimals" v={<Mono>{String(data.decimals)}</Mono>} />
      <Row k="Supply" v={<Mono>{String(data.supplyFormatted ?? data.supply)}</Mono>} strong />
      <Row k="Owner" v={<Mono>{truncateAddress(String(data.owner ?? ""))}</Mono>} />
    </Card>
  );
}

export function TokenListCard({ data }: { data: Record<string, unknown> }) {
  const tokens = (data.tokens as Array<Record<string, unknown>>) ?? [];
  return (
    <Card icon="🪙" label={`Tokens (${tokens.length})`}>
      {tokens.length === 0 ? (
        <p className="text-sm text-fg-muted">No tokens owned.</p>
      ) : (
        <ul className="space-y-1.5">
          {tokens.map((t, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <Mono>#{String(t.assetId)}</Mono>
              <span className="font-medium text-fg">{String(t.symbol)}</span>
              <span className="text-fg-secondary">{String(t.name)}</span>
              <span className="ml-auto font-mono text-fg-secondary">{String(t.supplyFormatted)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
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
      <Card icon="✓" label="Transfer confirmed" tone="success">
        <Row k="To" v={<Mono>{truncateAddress(input.to)}</Mono>} />
        <Row k="Amount" v={<Mono>{input.amount} POT</Mono>} strong />
        <Row k="Tx" v={<Mono>{truncateAddress(output.txHash, 8, 6)}</Mono>} />
        <Row k="Block" v={<Mono>{truncateAddress(output.blockHash, 8, 6)}</Mono>} />
      </Card>
    );
  }
  return (
    <Card icon="↗" label="Transfer preview" tone={error ? "destructive" : "pending"}>
      <Row k="To" v={<Mono>{truncateAddress(input.to)}</Mono>} />
      <Row k="Amount" v={<Mono>{input.amount} POT</Mono>} strong />
      {error && <p className="mt-2 font-mono text-sm text-destructive">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onSign}
          disabled={!canSign || signing}
          className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white transition-[transform,filter] hover:-translate-y-px hover:brightness-110 focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          {signing ? "Signing…" : canSign ? "Sign & Send" : "Connect wallet to sign"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={signing}
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-fg-secondary transition-colors hover:border-border-hover disabled:opacity-40"
        >
          Cancel
        </button>
      </div>
    </Card>
  );
}
