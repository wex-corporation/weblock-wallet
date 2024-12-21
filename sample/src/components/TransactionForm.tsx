import { useState } from "react";
import { useWallet } from "../contexts/WalletContext";

export function TransactionForm() {
  const { sdk, walletInfo, isConnected } = useWallet();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  if (!isConnected || !walletInfo) {
    return null;
  }

  const handleTransfer = async () => {
    if (!to || !amount) return;

    setLoading(true);
    try {
      const response = await sdk.asset.transfer({
        networkId: walletInfo.network.current?.id || "",
        to,
        amount,
        type: "NATIVE",
        tokenAddress: "", // Native token transfer
        symbol: walletInfo.assets.native.symbol,
      });

      setTxHash(response.transaction.hash);
    } catch (error) {
      console.error("Transfer failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded">
      <h3 className="font-bold">Send {walletInfo.assets.native.symbol}</h3>

      <input
        type="text"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        placeholder="Recipient address"
        className="w-full p-2 border rounded"
      />

      <input
        type="text"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        className="w-full p-2 border rounded"
      />

      <button
        onClick={handleTransfer}
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        {loading ? "Sending..." : "Send"}
      </button>

      {txHash && (
        <div className="text-sm">
          Transaction Hash: <span className="font-mono">{txHash}</span>
        </div>
      )}
    </div>
  );
}
