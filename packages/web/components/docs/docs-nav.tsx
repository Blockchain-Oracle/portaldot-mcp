"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Rocket, Boxes, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/docs", label: "Getting started", icon: Rocket },
  { href: "/docs/tools", label: "Tool catalog", icon: Boxes },
  { href: "/docs/skill", label: "Agent skill", icon: Sparkles },
];

export function DocsNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-24 space-y-1">
      <p className="px-3 pb-2 font-mono text-[11px] uppercase tracking-widest text-fg-muted">Docs</p>
      {NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary/12 font-medium text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
