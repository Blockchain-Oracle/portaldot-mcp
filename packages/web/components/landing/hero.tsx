"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import { BlockHeightTicker } from "./block-height-ticker";

// Dynamic-import the r3f canvas so three.js never touches the SSR bundle.
const HeroWave = dynamic(() => import("./hero-wave"), { ssr: false });

const ROTATING_PROMPTS = [
  "What's the latest block on Portaldot?",
  "Show me my balance and recent transfers",
  "Who are the active validators right now?",
  "Send 1 POT to 5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
];

export function Hero() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const placeholder = useTypewriterPlaceholder(ROTATING_PROMPTS, prompt.length === 0);

  function submit() {
    const t = prompt.trim();
    if (!t) {
      router.push("/app");
      return;
    }
    router.push("/app?prompt=" + encodeURIComponent(t));
  }

  return (
    <section className="relative isolate flex min-h-[92vh] items-center overflow-hidden">
      {/* HeroWave canvas — sits behind content */}
      <div className="absolute inset-0 -z-10">
        <HeroWave />
      </div>

      {/* Floor gradient — pulls the bottom darker so wave fades into the page */}
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-2/3"
        style={{
          background:
            "linear-gradient(to top, var(--background) 8%, transparent 90%)",
        }}
        aria-hidden
      />
      {/* Vignette — pulls the corners darker to keep the eye on copy */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at center 30%, transparent 0%, var(--background) 92%)",
        }}
        aria-hidden
      />

      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pt-32 pb-20 text-center">
        <BlockHeightTicker />

        <h1
          className="mt-7 font-display text-balance text-5xl font-medium leading-[1.02] tracking-[-0.025em] text-foreground sm:text-6xl md:text-7xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Portaldot, in{" "}
          <em className="font-medium italic text-foreground">plain language</em>
          <span className="text-primary">.</span>
        </h1>

        <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-fg-secondary sm:text-lg">
          The first MCP server for Portaldot. Ask in natural language — read
          balances, blocks, validators, tokens; sign with your own wallet.{" "}
          <span className="text-foreground">34 onchain tools, no glue code.</span>
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="mt-9 w-full max-w-2xl"
        >
          <div
            className={
              "group relative flex items-center gap-2 rounded-full border border-border-strong " +
              "bg-card/70 px-2 py-2 backdrop-blur-xl " +
              "shadow-[0_8px_36px_-12px_rgba(0,0,0,0.55)] " +
              "transition-colors focus-within:border-primary"
            }
          >
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={placeholder}
              aria-label="Ask Portaldot"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent px-4 py-2 text-[15px] text-foreground outline-none placeholder:text-fg-muted"
            />
            <button
              type="submit"
              aria-label="Open the app"
              className={
                "inline-flex shrink-0 items-center gap-1.5 rounded-full " +
                "bg-primary px-4 h-10 text-[13px] font-semibold text-primary-foreground " +
                "transition-[transform,filter] hover:-translate-y-px hover:brightness-110 " +
                "shadow-[0_0_22px_-4px_oklch(0.66_0.22_288/65%)]"
              }
            >
              <span className="hidden sm:inline">Open the app</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
          <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-fg-muted">
            press enter to open in the app
          </p>
        </form>
      </div>
    </section>
  );
}

/* ───── Typewriter placeholder ─────────────────────────────────────────────
   Cycle through prompts: type char-by-char, hold, erase, advance. Runs only
   while the input is empty (`active` toggles on text-entry). */
function useTypewriterPlaceholder(prompts: string[], active: boolean): string {
  const [text, setText] = useState("");
  const stateRef = useRef({ i: 0, j: 0, deleting: false, raf: 0 as unknown as ReturnType<typeof setTimeout> });

  // Stable copy of prompts to avoid effect churn
  const list = useMemo(() => prompts.slice(), [prompts]);

  useEffect(() => {
    if (!active) {
      clearTimeout(stateRef.current.raf);
      setText("");
      return;
    }
    const TYPE_MS = 38;
    const ERASE_MS = 22;
    const HOLD_MS = 1500;
    const BETWEEN_MS = 400;

    function step() {
      const s = stateRef.current;
      const current = list[s.i % list.length];
      if (!s.deleting) {
        if (s.j < current.length) {
          s.j += 1;
          setText(current.slice(0, s.j));
          s.raf = setTimeout(step, TYPE_MS);
        } else {
          s.deleting = true;
          s.raf = setTimeout(step, HOLD_MS);
        }
      } else {
        if (s.j > 0) {
          s.j -= 1;
          setText(current.slice(0, s.j));
          s.raf = setTimeout(step, ERASE_MS);
        } else {
          s.deleting = false;
          s.i = (s.i + 1) % list.length;
          s.raf = setTimeout(step, BETWEEN_MS);
        }
      }
    }

    stateRef.current = { i: 0, j: 0, deleting: false, raf: setTimeout(step, 600) };
    return () => clearTimeout(stateRef.current.raf);
  }, [list, active]);

  return active ? text || "Ask Portaldot…" : "Ask Portaldot…";
}
