"use client";
import { WeBlockSDK, NetworkInfo } from "@wefunding-dev/wallet";
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
  const [rpcResults, setRpcResults] = useState<{
    balance?: string;
    blockNumber?: number;
    txCount?: number;
    gasPrice?: string;
    estimateGas?: number;
  }>({});
  const [rpcLoading, setRpcLoading] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sdk = new WeBlockSDK({
        environment: "local",
        apiKey: "MCowBQYDK2VwAyEASXmv-39yF5Wx1vX9lPuP7_9qgWVeGXMdAWr-TKalKMw=",
        orgHost: "http://localhost:3000",
      });
      setSdk(sdk);
    }
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

        const networks = await sdk?.network.getAvailableNetworks();
        setNetworks(networks || []);
        const current = await sdk?.network.getCurrentNetwork();
        setCurrentNetwork(current || null);
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

  // RPC test handlers
  const handleGetBalance = async () => {
    if (!walletAddress) return;
    try {
      setRpcLoading("balance");
      const balance = await sdk?.wallet.getBalance(
        walletAddress,
        currentNetwork?.chainId || 0
      );
      setRpcResults((prev) => ({ ...prev, balance }));
      setError(undefined);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to get balance"
      );
    } finally {
      setRpcLoading("");
    }
  };

  const handleGetBlockNumber = async () => {
    try {
      setRpcLoading("blockNumber");
      const blockNumber = await sdk?.wallet.getBlockNumber(
        currentNetwork?.chainId || 0
      );
      setRpcResults((prev) => ({ ...prev, blockNumber }));
      setError(undefined);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to get block number"
      );
    } finally {
      setRpcLoading("");
    }
  };

  const handleGetTransactionCount = async () => {
    if (!walletAddress) return;
    try {
      setRpcLoading("txCount");
      const txCount = await sdk?.wallet.getTransactionCount(
        walletAddress,
        currentNetwork?.chainId || 0
      );
      setRpcResults((prev) => ({ ...prev, txCount }));
      setError(undefined);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to get transaction count"
      );
    } finally {
      setRpcLoading("");
    }
  };

  const handleGetGasPrice = async () => {
    try {
      setRpcLoading("gasPrice");
      const gasPrice = await sdk?.wallet.getGasPrice(
        currentNetwork?.chainId || 0
      );
      setRpcResults((prev) => ({ ...prev, gasPrice }));
      setError(undefined);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to get gas price"
      );
    } finally {
      setRpcLoading("");
    }
  };

  const handleEstimateGas = async () => {
    if (!walletAddress) return;
    try {
      setRpcLoading("estimateGas");
      const estimateGas = await sdk?.wallet.estimateGas(
        {
          from: walletAddress,
          to: walletAddress,
          value: "0x0",
        },
        currentNetwork?.chainId || 0
      );
      setRpcResults((prev) => ({ ...prev, estimateGas }));
      setError(undefined);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to estimate gas"
      );
    } finally {
      setRpcLoading("");
    }
  };

  const handleSignOut = async () => {
    try {
      await sdk?.user.signOut();
      setStatus(undefined);
      setWalletAddress(undefined);
      setNetworks([]);
      setCurrentNetwork(null);
      setRpcResults({});
      setError(undefined);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to sign out");
    }
  };

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

        {/* RPC Tests (show when wallet is ready) */}
        {status === "WALLET_READY" && currentNetwork && (
          <div className="mt-6">
            <div className="p-6 bg-white rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                RPC Tests
              </h2>

              {/* Basic Info */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-medium text-gray-700">
                  Basic Info
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      rpcLoading === "balance"
                        ? "bg-gray-100 text-gray-500"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                    onClick={handleGetBalance}
                    disabled={rpcLoading === "balance"}
                  >
                    Get Balance
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      rpcLoading === "blockNumber"
                        ? "bg-gray-100 text-gray-500"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                    onClick={handleGetBlockNumber}
                    disabled={rpcLoading === "blockNumber"}
                  >
                    Get Block Number
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      rpcLoading === "txCount"
                        ? "bg-gray-100 text-gray-500"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                    onClick={handleGetTransactionCount}
                    disabled={rpcLoading === "txCount"}
                  >
                    Get Tx Count
                  </button>
                </div>
              </div>

              {/* Transaction */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-medium text-gray-700">
                  Transaction
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      rpcLoading === "gasPrice"
                        ? "bg-gray-100 text-gray-500"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                    onClick={handleGetGasPrice}
                    disabled={rpcLoading === "gasPrice"}
                  >
                    Get Gas Price
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      rpcLoading === "estimateGas"
                        ? "bg-gray-100 text-gray-500"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                    onClick={handleEstimateGas}
                    disabled={rpcLoading === "estimateGas"}
                  >
                    Estimate Gas
                  </button>
                </div>
              </div>

              {/* Results display */}
              {Object.entries(rpcResults).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-3 rounded-lg mb-2">
                  <p className="text-sm text-gray-600 capitalize">{key}</p>
                  <p className="font-mono text-sm break-all">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Sign Out button when wallet is ready */}
        {status === "WALLET_READY" && (
          <div className="mt-6">
            <button
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        )}

        {/* WalletInfo JSON 표시 */}
        {status === "WALLET_READY" && walletAddress && (
          <div className="mt-6">
            <div className="p-6 bg-white rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                WalletInfo Response
              </h2>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(
                  {
                    address: walletAddress,
                    network: {
                      current: currentNetwork,
                      available: networks,
                    },
                    assets: {
                      native: {
                        symbol: currentNetwork?.symbol || "ETH",
                        balance: rpcResults.balance || "0",
                        decimals: 18,
                      },
                      tokens: [],
                      nfts: [],
                      securities: [],
                    },
                    latestTransaction: null,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}

        {/* 예쁜 UI로 WalletInfo 표시 */}
        {status === "WALLET_READY" && walletAddress && (
          <div className="mt-6">
            <div className="p-6 bg-white rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Wallet Dashboard
              </h2>

              {/* 지갑 주소 및 네트워크 정보 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4 bg-blue-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">
                      Wallet Address
                    </p>
                    <p className="font-mono text-sm">{walletAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-600 font-medium">
                      Current Network
                    </p>
                    <p className="font-medium">
                      {currentNetwork?.name || "Not Selected"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 자산 정보 */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-3">
                  Assets
                </h3>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-green-600 font-medium">
                        Native Balance
                      </p>
                      <p className="text-2xl font-bold text-green-700">
                        {rpcResults.balance || "0"}{" "}
                        {currentNetwork?.symbol || "ETH"}
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* 네트워크 목록 */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">
                  Available Networks
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {networks.map((network) => (
                    <div
                      key={network.id}
                      className={`p-3 rounded-lg border ${
                        currentNetwork?.id === network.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      }`}
                    >
                      <p className="font-medium">{network.name}</p>
                      <p className="text-sm text-gray-500">
                        Chain ID: {network.chainId}
                      </p>
                      <p className="text-sm text-gray-500">
                        {network.isTestnet ? "Testnet" : "Mainnet"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
