import { Suspense } from "react";
import { WalletProvider } from "@/lib/wallet";
import { ChatApp } from "@/components/app/chat-app";

export default function AppPage() {
  return (
    <WalletProvider>
      <Suspense fallback={null}>
        <ChatApp />
      </Suspense>
    </WalletProvider>
  );
}
