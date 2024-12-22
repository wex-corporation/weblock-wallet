import { useState } from "react";
import { useWallet } from "../contexts/WalletContext";
import {
  TransactionStatus,
  TransactionStatusEvent,
} from "@wefunding-dev/wallet";

export function TransactionForm() {
  const { sdk, walletInfo, isConnected } = useWallet();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<{
    hash: string;
    status: TransactionStatus;
    error?: string;
  } | null>(null);

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

      // 초기 트랜잭션 상태 설정
      setTxStatus({
        hash: response.transaction.hash,
        status: TransactionStatus.PENDING,
      });

      // 트랜잭션 상태 추적
      sdk.asset.on(
        "transactionStatusChanged",
        (event: TransactionStatusEvent) => {
          if (event.hash === response.transaction.hash) {
            setTxStatus({
              hash: event.hash,
              status: event.status,
              error: event.error,
            });
            if (event.status !== TransactionStatus.PENDING) {
              setLoading(false);
            }
          }
        }
      );
    } catch (error) {
      console.error("Transfer failed:", error);
      setTxStatus({
        hash: "",
        status: TransactionStatus.FAILED,
        error: error instanceof Error ? error.message : "Transfer failed",
      });
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

      {txStatus && (
        <div className="text-sm">
          <div>
            Transaction Hash: <span className="font-mono">{txStatus.hash}</span>
          </div>
          <div>Status: {txStatus.status}</div>
          {txStatus.error && (
            <div className="text-red-500">Error: {txStatus.error}</div>
          )}
        </div>
      )}
    </div>
  );
}
