"use client";

import Link from "next/link";
import {
  Plus,
  Activity,
  Wallet,
  Blocks,
  Coins,
  ShieldCheck,
  BadgeCheck,
  ArrowUpRight,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface Capability {
  icon: LucideIcon;
  label: string;
  prompt: string;
}

const capabilities: Capability[] = [
  { icon: Wallet, label: "Balances", prompt: "Give me a full overview of my account" },
  { icon: Activity, label: "Network", prompt: "What's the Portaldot network status right now?" },
  { icon: Blocks, label: "Blocks", prompt: "Show me the latest Portaldot block." },
  { icon: ShieldCheck, label: "Validators", prompt: "Who are the active validators?" },
  { icon: Coins, label: "Tokens", prompt: "List the tokens I own." },
  { icon: BadgeCheck, label: "Identity", prompt: "Resolve my on-chain identity" },
  { icon: ArrowUpRight, label: "Transfers", prompt: "Send 1 POT to 5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty" },
  { icon: ListChecks, label: "Tasks", prompt: "List my onchain tasks." },
];

function DiamondMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 2 22 12 12 22 2 12 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 7 17 12 12 17 7 12 12 7Z" fill="currentColor" />
    </svg>
  );
}

export function AppSidebar({
  onNewChat,
  onPrompt,
  disabled,
}: {
  onNewChat: () => void;
  onPrompt: (text: string) => void;
  disabled?: boolean;
}) {
  return (
    <Sidebar collapsible="icon" className="border-border">
      <SidebarHeader className="border-b border-border">
        <Link href="/" className="flex items-center gap-2 px-1.5 py-1 text-foreground">
          <DiamondMark className="size-5 shrink-0 text-primary" />
          <span className="font-semibold tracking-tight group-data-[collapsible=icon]:hidden">portaldot-mcp</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onNewChat}
                  tooltip="New chat"
                  className="bg-primary/12 text-primary hover:bg-primary/18 hover:text-primary"
                >
                  <Plus />
                  <span>New chat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Capabilities</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {capabilities.map((c) => (
                <SidebarMenuItem key={c.label}>
                  <SidebarMenuButton onClick={() => onPrompt(c.prompt)} disabled={disabled} tooltip={c.label}>
                    <c.icon />
                    <span>{c.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          <span className="relative flex size-2 items-center justify-center">
            <span className="absolute size-2 animate-ping rounded-full bg-success/60" />
            <span className="size-1.5 rounded-full bg-success" />
          </span>
          Portaldot · live · POT
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
