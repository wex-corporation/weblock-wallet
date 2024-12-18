"use client";

import { WeBlockSDK } from "@weblock-wallet/sdk";
import { useEffect, useState } from "react";

export default function Home() {
  const [sdk, setSdk] = useState<WeBlockSDK>();
  const [status, setStatus] = useState<
    "INIT" | "NEW_USER" | "WALLET_READY" | "NEEDS_PASSWORD"
  >();
  const [walletAddress, setWalletAddress] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const sdk = new WeBlockSDK({
      environment: "local",
      apiKey: "MCowBQYDK2VwAyEASXmv-39yF5Wx1vX9lPuP7_9qgWVeGXMdAWr-TKalKMw=",
      orgHost: "http://localhost:3000",
    });
    setSdk(sdk);
  }, []);

  const handleSignIn = async () => {
    try {
      const result = await sdk?.user.signIn("google.com");
      console.log("SignIn Response:", result);
      setStatus(result?.status);
      setError(undefined);
    } catch (error) {
      console.error("SignIn Error:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    }
  };

  const handleCreateWallet = async (withPassword: boolean) => {
    try {
      const password = withPassword ? "testpassword123" : "";
      console.log("Creating wallet with password:", password ? "YES" : "NO");
      const result = await sdk?.user.createWallet(password);
      console.log("Wallet Created:", result);
      setWalletAddress(result?.wallet.address);
      setError(undefined);
    } catch (error) {
      console.error("Wallet Creation Error:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    }
  };

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">WeBlock SDK Sample</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      <div className="space-y-4">
        {!status && (
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleSignIn}
          >
            Sign in with Google
          </button>
        )}

        {status === "NEW_USER" && (
          <div className="space-y-2">
            <p className="mb-2">Status: New User</p>
            <div className="space-x-2">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => handleCreateWallet(true)}
              >
                Create Wallet with Password
              </button>
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                onClick={() => handleCreateWallet(false)}
              >
                Create Wallet without Password
              </button>
            </div>
          </div>
        )}

        {walletAddress && (
          <div className="p-4 bg-gray-100 rounded">
            <h2 className="font-bold mb-2">Wallet Created!</h2>
            <p className="font-mono break-all">Address: {walletAddress}</p>
          </div>
        )}

        {status && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <p>Current Status: {status}</p>
          </div>
        )}
      </div>
    </main>
  );
}
