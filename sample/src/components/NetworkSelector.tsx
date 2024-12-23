import { useWallet } from "../contexts/WalletContext";

export function NetworkSelector() {
  const { walletInfo, sdk, isConnected, getWalletInfo } = useWallet();

  if (!isConnected || !walletInfo) return null;

  const handleNetworkChange = async (networkId: string) => {
    try {
      await sdk.network.switchNetwork(networkId);
      await getWalletInfo();
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-semibold mb-4">Network Selection</h2>
      <div className="space-y-2">
        {walletInfo.network.available.map((network) => (
          <button
            key={network.id}
            onClick={() => handleNetworkChange(network.id)}
            className={`w-full p-2 rounded transition-colors ${
              network.id === walletInfo.network.current?.id
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {network.name}
          </button>
        ))}
      </div>
    </div>
  );
}
