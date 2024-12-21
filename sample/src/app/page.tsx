"use client";

import { WalletProvider } from "../contexts/WalletContext";
import { SignIn } from "../components/SignIn";
import { WalletConnect } from "../components/WalletConnect";
import { WalletInfo } from "../components/WalletInfo";
import { TransactionForm } from "../components/TransactionForm";

export default function Home() {
  return (
    <WalletProvider>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">WeBlock Wallet SDK Demo</h1>
          <p className="text-gray-600 mt-2">
            Experience Web3 wallet integration
          </p>
        </div>

        <div className="space-y-6">
          {/* 로그인 섹션 */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
              1. Connect with Google
            </h2>
            <SignIn />
          </div>

          {/* 지갑 생성/복구 섹션 */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">2. Setup Your Wallet</h2>
            <WalletConnect />
          </div>

          {/* 지갑 정보 섹션 */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
              3. Wallet Information
            </h2>
            <WalletInfo />
          </div>

          {/* 트랜잭션 섹션 */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">4. Send Transaction</h2>
            <TransactionForm />
          </div>
        </div>
      </div>
    </WalletProvider>
  );
}
