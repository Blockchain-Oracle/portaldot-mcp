"use client";

import { useEffect, useState } from "react";
import { getBrowserApi } from "@/lib/polkadot";

/**
 * Live block-height ticker — subscribes to `chain.subscribeNewHeads` and
 * renders an instrument-panel eyebrow chip. Cyan dot is the telemetry signal.
 *
 * Cheap: one persistent WS connection reused by all wallet operations.
 */
export function BlockHeightTicker({ className }: { className?: string }) {
  const [height, setHeight] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    let cancelled = false;
    (async () => {
      try {
        const api = await getBrowserApi();
        if (cancelled) return;
        setConnected(true);
        const u = await api.rpc.chain.subscribeNewHeads((head) => {
          setHeight(head.number.toNumber());
        });
        unsub = u as unknown as () => void;
      } catch {
        // silent — eyebrow degrades gracefully
        if (!cancelled) setConnected(false);
      }
    })();
    return () => {
      cancelled = true;
      try {
        unsub?.();
      } catch {
        /* noop */
      }
    };
  }, []);

  return (
    <span
      className={
        "inline-flex items-center gap-2 rounded-full border border-border-strong " +
        "bg-card/60 backdrop-blur px-3 py-1 font-mono text-[10px] tracking-[0.18em] uppercase text-fg-secondary " +
        (className ?? "")
      }
    >
      <span className="relative inline-flex size-1.5 items-center justify-center">
        <span
          className={
            "absolute inline-flex size-1.5 rounded-full " +
            (connected
              ? "bg-telemetry glow-telemetry animate-[pulse-soft_2.4s_ease-in-out_infinite]"
              : "bg-fg-muted")
          }
        />
      </span>
      <span>Mainnet</span>
      <span className="text-fg-muted">·</span>
      <span className="text-foreground tabular">
        {height !== null ? `#${height.toLocaleString()}` : "connecting"}
      </span>
    </span>
  );
}
