import { useState } from "react";
import { useWallet } from "../contexts/WalletContext";
import { TransactionStatus, TokenAmount } from "@wefunding-dev/wallet";

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
  const [estimatedGas, setEstimatedGas] = useState<{
    limit: string;
    price: string;
    total: string;
  } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [txStatus, setTxStatus] = useState<{
    hash: string;
    status: TransactionStatus;
    error?: string;
  } | null>(null);

  if (!isConnected || !walletInfo) {
    return null;
  }

  // 가스비 추정 함수
  const estimateGasCost = async () => {
    if (!to || !amount) return;

    try {
      const chainId = walletInfo.network.current?.chainId || 0;

      // value 없이 기본 가스 추정
      const gasLimit = await sdk.wallet.estimateGas(
        {
          from: walletInfo.address,
          to,
        },
        chainId
      );

      const gasPrice = await sdk.wallet.getGasPrice(chainId);
      const totalGasCost = BigInt(gasLimit) * BigInt(gasPrice);

      setEstimatedGas({
        limit: gasLimit.toString(),
        price: TokenAmount.fromWei(gasPrice, 9) + " Gwei",
        total: TokenAmount.fromWei(totalGasCost.toString(), 18),
      });
      setShowConfirm(true);
    } catch (error) {
      console.error("Gas estimation failed:", error);
      setTxStatus({
        hash: "",
        status: TransactionStatus.FAILED,
        error: error instanceof Error ? error.message : "Gas estimation failed",
      });
    }
  };

  // 실제 전송 처리
  const handleTransfer = async () => {
    if (!to || !amount || !estimatedGas) return;
    setLoading(true);

    try {
      const weiAmount = TokenAmount.toWei(amount, 18);

      const response = await sdk.asset.transfer({
        networkId: walletInfo.network.current?.id || "",
        to,
        amount: weiAmount,
        type: "NATIVE",
        tokenAddress: "",
        symbol: walletInfo.assets.native.symbol,
        gasLimit: estimatedGas.limit,
        gasPrice: TokenAmount.toWei(estimatedGas.price.replace(" Gwei", ""), 9),
      });

      setTxStatus({
        hash: response.transaction.hash,
        status: TransactionStatus.PENDING,
      });
      setShowConfirm(false);

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

  const resetForm = () => {
    setShowConfirm(false);
    setEstimatedGas(null);
    setTxStatus(null);
  };

  return (
    <div className="space-y-4 p-4 border rounded">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">Send {walletInfo.assets.native.symbol}</h3>
        <span className="text-sm text-gray-500">
          Balance: {walletInfo.assets.native.balance?.formatted || "0"}{" "}
          {walletInfo.assets.native.symbol}
        </span>
      </div>

      <input
        type="text"
        value={to}
        onChange={(e) => {
          setTo(e.target.value);
          resetForm();
        }}
        placeholder="Recipient address"
        className="w-full p-2 border rounded"
      />

      <div className="relative">
        <input
          type="text"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            resetForm();
          }}
          placeholder="Amount"
          className="w-full p-2 border rounded"
        />
        <button
          onClick={() => {
            setAmount(walletInfo.assets.native.balance?.formatted || "0");
            resetForm();
          }}
          className="absolute right-2 top-2 text-sm text-blue-500 hover:text-blue-700"
          type="button"
        >
          MAX
        </button>
      </div>

      {!showConfirm ? (
        <button
          onClick={estimateGasCost}
          disabled={!to || !amount || loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          Preview Transfer
        </button>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
            <div>Estimated Gas Limit: {estimatedGas?.limit}</div>
            <div>Gas Price: {estimatedGas?.price} Wei</div>
            <div>
              Total Gas Cost: {estimatedGas?.total}{" "}
              {walletInfo.assets.native.symbol}
            </div>
            <div className="mt-2 pt-2 border-t">
              <div>
                Transfer Amount: {amount} {walletInfo.assets.native.symbol}
              </div>
              <div>To: {to}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleTransfer}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
            >
              {loading ? "Sending..." : "Confirm Transfer"}
            </button>
          </div>
        </div>
      )}

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
