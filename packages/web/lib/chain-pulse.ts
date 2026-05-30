"use client";

/*
  Shared block-interval store. One subscription to `chain.subscribeNewHeads`
  + `query.timestamp.now` for every consumer (sparklines, latency widgets,
  the BlockInfoCard). Keeps a rolling buffer of recent block-to-block deltas
  in milliseconds. No mocked data: the buffer starts empty and only fills as
  new blocks arrive.
*/
import { useEffect, useSyncExternalStore } from "react";
import { getBrowserApi } from "@/lib/polkadot";

const MAX = 16;

interface Pulse {
  height: number | null;
  intervals: number[]; // ms between consecutive blocks
  latencyMs: number | null; // wall-clock time we saw the last head (approx)
}

let state: Pulse = { height: null, intervals: [], latencyMs: null };
const listeners = new Set<() => void>();
let subscribed = false;
let unsub: (() => void) | null = null;

function emit() {
  for (const l of listeners) l();
}

async function start() {
  if (subscribed) return;
  subscribed = true;
  try {
    const api = await getBrowserApi();
    let lastSeenMs: number | null = null;
    const u = await api.rpc.chain.subscribeNewHeads((head) => {
      const now = performance.now();
      const h = head.number.toNumber();
      let nextIntervals = state.intervals;
      let nextLatency = state.latencyMs;
      if (lastSeenMs !== null) {
        const dt = Math.round(now - lastSeenMs);
        nextIntervals = [...state.intervals, dt].slice(-MAX);
        nextLatency = dt;
      }
      lastSeenMs = now;
      state = { height: h, intervals: nextIntervals, latencyMs: nextLatency };
      emit();
    });
    unsub = u as unknown as () => void;
  } catch {
    // degrade silently — consumers see height: null and an empty buffer
    subscribed = false;
  }
}

function stop() {
  if (listeners.size > 0) return;
  try {
    unsub?.();
  } catch {
    /* noop */
  }
  unsub = null;
  subscribed = false;
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  void start();
  return () => {
    listeners.delete(l);
    if (listeners.size === 0) stop();
  };
}

function getSnapshot(): Pulse {
  return state;
}

const serverSnap: Pulse = { height: null, intervals: [], latencyMs: null };

export function useChainPulse(): Pulse {
  // ensure listener is attached even if the component renders to SSR (it won't,
  // but useSyncExternalStore wants a server snap fn anyway)
  useEffect(() => () => {}, []);
  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnap);
}
