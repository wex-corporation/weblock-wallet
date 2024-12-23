import { useState } from "react";
import { useWallet } from "../contexts/WalletContext";
import { TransactionStatus } from "@wefunding-dev/wallet";
import { TokenAmount } from "@wefunding-dev/wallet";

interface TransactionStatusEvent {
  hash: string;
  status: TransactionStatus;
  error?: string;
  timestamp: number;
}

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
    setTxStatus(null);

    try {
      // 금액을 wei 단위로 변환
      const weiAmount = TokenAmount.toWei(amount, 18); // 네이티브 토큰은 18 decimals

      const response = await sdk.asset.transfer({
        networkId: walletInfo.network.current?.id || "",
        to,
        amount: weiAmount,
        type: "NATIVE",
        tokenAddress: "",
        symbol: walletInfo.assets.native.symbol,
      });

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

  // 현재 잔액 표시를 위한 포맷팅
  const currentBalance = walletInfo.assets.native.balance?.formatted || "0";

  return (
    <div className="space-y-4 p-4 border rounded">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">Send {walletInfo.assets.native.symbol}</h3>
        <span className="text-sm text-gray-500">
          Balance: {currentBalance} {walletInfo.assets.native.symbol}
        </span>
      </div>

      <input
        type="text"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        placeholder="Recipient address"
        className="w-full p-2 border rounded"
      />

      <div className="relative">
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="w-full p-2 border rounded"
        />
        <button
          onClick={() => setAmount(currentBalance)}
          className="absolute right-2 top-2 text-sm text-blue-500 hover:text-blue-700"
          type="button"
        >
          MAX
        </button>
      </div>

      <button
        onClick={handleTransfer}
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        {loading ? "Sending..." : "Send"}
      </button>

      {txStatus && (
        <div className="text-sm space-y-1">
          <div>
            Transaction Hash: <span className="font-mono">{txStatus.hash}</span>
          </div>
          <div>
            Status:{" "}
            <span
              className={
                txStatus.status === TransactionStatus.SUCCESS
                  ? "text-green-500"
                  : txStatus.status === TransactionStatus.FAILED
                  ? "text-red-500"
                  : "text-yellow-500"
              }
            >
              {txStatus.status}
            </span>
          </div>
          {txStatus.error && (
            <div className="text-red-500">Error: {txStatus.error}</div>
          )}
        </div>
      )}
    </div>
  );
}
