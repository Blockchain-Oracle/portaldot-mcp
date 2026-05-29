import { WalletProvider } from "@/lib/wallet";
import { ChatApp } from "@/components/app/chat-app";

export default function AppPage() {
  return (
    <WalletProvider>
      <ChatApp />
    </WalletProvider>
  );
}
