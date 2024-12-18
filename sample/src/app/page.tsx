"use client";

import { WeBlockSDK, NetworkInfo } from "@weblock-wallet/sdk";
import { useEffect, useState } from "react";

const getStatusDisplay = (
  status: "INIT" | "NEW_USER" | "WALLET_READY" | "NEEDS_PASSWORD" | undefined
) => {
  switch (status) {
    case "NEW_USER":
      return "New User - Create Your Wallet";
    case "NEEDS_PASSWORD":
      return "Existing Wallet - Enter Password";
    case "WALLET_READY":
      return "Wallet Ready";
    default:
      return "Please Sign In";
  }
};

const SAMPLE_NETWORK = {
  name: "Polygon Mumbai",
  rpcUrl: "https://rpc-mumbai.maticvigil.com",
  chainId: 80001,
};

export default function Home() {
  const [sdk, setSdk] = useState<WeBlockSDK>();
  const [status, setStatus] = useState<
    "INIT" | "NEW_USER" | "WALLET_READY" | "NEEDS_PASSWORD"
  >();
  const [walletAddress, setWalletAddress] = useState<string>();
  const [error, setError] = useState<string>();
  const [networks, setNetworks] = useState<NetworkInfo[]>([]);
  const [currentNetwork, setCurrentNetwork] = useState<NetworkInfo | null>(
    null
  );

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

      if (result?.wallet) {
        setWalletAddress(result.wallet.address);
      }
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

  const handleRetrieveWallet = async (password: string) => {
    try {
      console.log("Retrieving wallet with password:", password);
      const result = await sdk?.user.retrieveWallet(password);
      console.log("Wallet Retrieved:", result);

      if (result?.wallet) {
        setWalletAddress(result.wallet.address);
        setStatus("WALLET_READY");
      }
      setError(undefined);
    } catch (error) {
      console.error("Wallet Retrieval Error:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    }
  };

  const handleAddNetwork = async () => {
    try {
      await sdk?.network.addNetwork(SAMPLE_NETWORK);
      // Refresh networks list
      const networks = await sdk?.network.getAvailableNetworks();
      setNetworks(networks || []);
      setError(undefined);
    } catch (error) {
      console.error("Add Network Error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to add network"
      );
    }
  };

  const handleSwitchNetwork = async (networkId: string) => {
    try {
      await sdk?.network.switchNetwork(networkId);
      const current = await sdk?.network.getCurrentNetwork();
      setCurrentNetwork(current || null);
      setError(undefined);
    } catch (error) {
      console.error("Switch Network Error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to switch network"
      );
    }
  };

  useEffect(() => {
    if (status === "WALLET_READY" && sdk) {
      sdk.network.getAvailableNetworks().then(setNetworks);
      sdk.network.getCurrentNetwork().then(setCurrentNetwork);
    }
  }, [status, sdk]);

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        WeBlock SDK Sample
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Sign In */}
        {!status && (
          <div className="text-center py-8">
            <button
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={handleSignIn}
            >
              Sign in with Google
            </button>
          </div>
        )}

        {/* New User */}
        {status === "NEW_USER" && (
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {getStatusDisplay(status)}
            </h2>
            <div className="space-y-3">
              <button
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                onClick={() => handleCreateWallet(true)}
              >
                Create Wallet with Password
              </button>
              <button
                className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                onClick={() => handleCreateWallet(false)}
              >
                Create Wallet without Password
              </button>
            </div>
          </div>
        )}

        {/* Password Recovery */}
        {status === "NEEDS_PASSWORD" && (
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {getStatusDisplay(status)}
            </h2>
            <div className="space-y-3">
              <button
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                onClick={() => handleRetrieveWallet("testpassword123")}
              >
                Retrieve with Correct Password
              </button>
              <button
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                onClick={() => handleRetrieveWallet("wrongpassword")}
              >
                Try Wrong Password
              </button>
            </div>
          </div>
        )}

        {/* Wallet Ready */}
        {status === "WALLET_READY" && (
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {getStatusDisplay(status)}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                View Transactions
              </button>
              <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                Send Token
              </button>
            </div>
            <div className="mt-4">
              <button
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                onClick={() => setStatus("NEEDS_PASSWORD")}
              >
                Test Recovery Flow
              </button>
            </div>
          </div>
        )}

        {/* Wallet Info */}
        {walletAddress && (
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              Wallet Info
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-mono text-sm break-all">{walletAddress}</p>
            </div>
          </div>
        )}

        {/* Current Status */}
        {status && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            Current Status: {getStatusDisplay(status)}
          </div>
        )}

        {/* Network Management (show when wallet is ready) */}
        {status === "WALLET_READY" && (
          <div className="mt-6 space-y-6">
            <div className="p-6 bg-white rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Network Management
              </h2>

              {/* Add Network Button */}
              <button
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors mb-4"
                onClick={handleAddNetwork}
              >
                Add Mumbai Testnet
              </button>

              {/* Available Networks */}
              <div className="space-y-3">
                <p className="text-sm text-gray-600 font-semibold">
                  Available Networks:
                </p>
                {networks.map((network) => (
                  <button
                    key={network.id}
                    className={`w-full px-4 py-2 rounded-lg transition-colors ${
                      currentNetwork?.id === network.id
                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => handleSwitchNetwork(network.id)}
                  >
                    {network.name} ({network.symbol})
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
