"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { WalletPicker as WalletPickerMounted } from "@/components/wallet-picker";

export interface WalletAccount {
  address: string;
  name?: string;
  source?: string;
}

export interface KnownWallet {
  id: string; // matches window.injectedWeb3 key and account.meta.source
  name: string;
  install: string;
  tag?: string;
}

export interface DetectedWallet extends KnownWallet {
  installed: boolean;
}

/*
  Mainstream Polkadot wallets that ship a Substrate signer compatible with
  @polkadot/extension-dapp. Order is the order shown in the picker.
*/
export const KNOWN_WALLETS: KnownWallet[] = [
  {
    id: "subwallet-js",
    name: "SubWallet",
    install: "https://www.subwallet.app/download.html",
    tag: "Recommended",
  },
  {
    id: "talisman",
    name: "Talisman",
    install: "https://www.talisman.xyz/download",
  },
  {
    id: "polkadot-js",
    name: "Polkadot{.js}",
    install: "https://polkadot.js.org/extension/",
  },
  {
    id: "nova",
    name: "Nova Wallet",
    install: "https://novawallet.io/",
    tag: "Mobile",
  },
];

interface WalletContextValue {
  account: WalletAccount | null;
  accounts: WalletAccount[];
  connecting: boolean;
  error: string | null;
  pickerOpen: boolean;
  openPicker: () => void;
  closePicker: () => void;
  detectWallets: () => DetectedWallet[];
  connectWith: (id: string) => Promise<void>;
  disconnect: () => void;
  select: (address: string) => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

function readInjected(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  const inj = (window as unknown as { injectedWeb3?: Record<string, unknown> }).injectedWeb3;
  return inj ?? {};
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const openPicker = useCallback(() => {
    setError(null);
    setPickerOpen(true);
  }, []);
  const closePicker = useCallback(() => setPickerOpen(false), []);

  const detectWallets = useCallback((): DetectedWallet[] => {
    const inj = readInjected();
    return KNOWN_WALLETS.map((w) => ({ ...w, installed: Boolean(inj[w.id]) }));
  }, []);

  const connectWith = useCallback(async (id: string) => {
    setConnecting(true);
    setError(null);
    try {
      const inj = readInjected();
      if (!inj[id]) {
        setError(`${KNOWN_WALLETS.find((w) => w.id === id)?.name ?? id} isn't installed.`);
        return;
      }
      // web3Enable registers ALL extensions internally so web3FromSource can
      // later look up the signer for signing. We still scope the accounts the
      // user actually picked by filtering on meta.source below.
      const { web3Enable, web3Accounts } = await import("@polkadot/extension-dapp");
      const enabled = await web3Enable("portaldot-mcp");
      if (!enabled.some((e) => e.name === id)) {
        setError(`Couldn't talk to ${id}. Did you approve the connection?`);
        return;
      }
      const all = await web3Accounts();
      const filtered = all.filter((a) => a.meta.source === id);
      if (filtered.length === 0) {
        setError(`No accounts available in ${id}. Create one in the extension and try again.`);
        return;
      }
      const mapped = filtered.map((a) => ({
        address: a.address,
        name: a.meta.name,
        source: a.meta.source,
      }));
      setAccounts(mapped);
      const first = mapped[0];
      if (first) {
        setAccount(first);
        sessionStorage.setItem("portaldot-account", first.address);
        sessionStorage.setItem("portaldot-wallet", id);
      }
      setPickerOpen(false);
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setAccounts([]);
    sessionStorage.removeItem("portaldot-account");
    sessionStorage.removeItem("portaldot-wallet");
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

  // Silent reconnect: if the user was connected earlier this session and the
  // chosen wallet is still installed, re-enable it without prompting.
  useEffect(() => {
    const lastWallet = sessionStorage.getItem("portaldot-wallet");
    const lastAccount = sessionStorage.getItem("portaldot-account");
    if (!lastWallet || !lastAccount) return;
    void connectWith(lastWallet);
  }, [connectWith]);

  return (
    <WalletContext.Provider
      value={{
        account,
        accounts,
        connecting,
        error,
        pickerOpen,
        openPicker,
        closePicker,
        detectWallets,
        connectWith,
        disconnect,
        select,
      }}
    >
      {children}
      {/* Picker mounts once globally so any caller can openPicker() */}
      <WalletPickerMounted />
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
