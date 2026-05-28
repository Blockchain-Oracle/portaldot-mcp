"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export interface WalletAccount {
  address: string;
  name?: string;
}

interface WalletContextValue {
  account: WalletAccount | null;
  accounts: WalletAccount[];
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  select: (address: string) => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const { web3Enable, web3Accounts } = await import("@polkadot/extension-dapp");
      const extensions = await web3Enable("portaldot-mcp");
      if (extensions.length === 0) {
        setError("No Polkadot wallet found — install SubWallet or Talisman.");
        return;
      }
      const injected = await web3Accounts();
      const mapped = injected.map((a) => ({ address: a.address, name: a.meta.name }));
      setAccounts(mapped);
      if (mapped[0]) {
        setAccount(mapped[0]);
        sessionStorage.setItem("portaldot-account", mapped[0].address);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setAccounts([]);
    sessionStorage.removeItem("portaldot-account");
  }, []);

  const select = useCallback(
    (address: string) => {
      const next = accounts.find((a) => a.address === address);
      if (next) {
        setAccount(next);
        sessionStorage.setItem("portaldot-account", address);
      }
    },
    [accounts],
  );

  // Reconnect silently if the user connected earlier this session.
  useEffect(() => {
    if (sessionStorage.getItem("portaldot-account")) void connect();
  }, [connect]);

  return (
    <WalletContext.Provider
      value={{ account, accounts, connecting, error, connect, disconnect, select }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
