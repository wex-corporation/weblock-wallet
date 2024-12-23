"use client";

import { WalletProvider } from "../contexts/WalletContext";
import { WalletInfo } from "@/components/WalletInfo";
import { WalletConnect } from "@/components/WalletConnect";
import { TransactionForm } from "@/components/TransactionForm";
import { SignIn } from "@/components/SignIn";
import { SignOut } from "@/components/SignOut";
import { NetworkSelector } from "@/components/NetworkSelector";

export default function Home() {
  return (
    <WalletProvider>
      <main className="container mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold mb-8">WeBlock SDK Sample</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <SignIn />
            <WalletConnect />
            <WalletInfo />
            <NetworkSelector />
          </div>

          <div className="space-y-4">
            <TransactionForm />
            <SignOut />
          </div>
        </div>
      </main>
    </WalletProvider>
  );
}
