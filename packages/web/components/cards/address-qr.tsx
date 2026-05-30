"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

export interface AddressQRProps {
  value: string;
  size?: number;
  className?: string;
  /** Foreground color CSS value (must be solid). Defaults to current text color. */
  fg?: string;
  /** Background color CSS value. Defaults to transparent so the receipt shows through. */
  bg?: string;
  /** Optional caption beneath the code, e.g. "scan to send". */
  caption?: string;
}

export function AddressQR({
  value,
  size = 88,
  className,
  fg,
  bg = "transparent",
  caption,
}: AddressQRProps) {
  const [computedFg, setComputedFg] = React.useState<string>(fg ?? "#ffffff");
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (fg || !ref.current) return;
    const c = getComputedStyle(ref.current).color;
    if (c) setComputedFg(c);
  }, [fg]);

  return (
    <div ref={ref} className={cn("inline-flex flex-col items-center gap-1 text-foreground", className)}>
      <div
        className="rounded-md border border-border bg-surface-2/40 p-1.5"
        style={{ width: size + 12, height: size + 12 }}
      >
        <QRCodeSVG
          value={value}
          size={size}
          level="M"
          fgColor={fg ?? computedFg}
          bgColor={bg}
          marginSize={0}
        />
      </div>
      {caption && (
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-fg-muted">
          {caption}
        </span>
      )}
    </div>
  );
}
