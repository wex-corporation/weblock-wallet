"use client";

import { WalletSDK } from "@wefunding-dev/wallet-sdk";
import { useState } from "react";

export default function HomePage() {
  const [initialized, setInitialized] = useState(false);

  const initializeSDK = () => {
    const sdk = new WalletSDK();
    sdk.initialize({
      apiKey: "MCowBQYDK2VwAyEASXmv-39yF5Wx1vX9lPuP7_9qgWVeGXMdAWr-TKalKMw=",
      env: "local",
    });
    setInitialized(sdk.isInitialized());
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold mb-4">Welcome to WeBlock Wallet</h2>
      <p className="mb-6">Click the button below to initialize the SDK.</p>
      <button
        onClick={initializeSDK}
        className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
      >
        Initialize SDK
      </button>
      {initialized && (
        <p className="mt-4 text-green-600">SDK has been initialized!</p>
      )}
    </div>
  );
}
