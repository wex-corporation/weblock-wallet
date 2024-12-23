import { useWallet } from "../contexts/WalletContext";

export function WalletInfo() {
  const { walletInfo, isConnected } = useWallet();

  if (!isConnected || !walletInfo) {
    return null;
  }

  return (
    <div className="space-y-4 p-4 border rounded">
      <div>
        <h3 className="font-bold">Wallet Address</h3>
        <p className="font-mono">{walletInfo.address}</p>
      </div>

      <div>
        <h3 className="font-bold">Network</h3>
        <p>{walletInfo.network.current?.name || "Not connected"}</p>
      </div>

      <div>
        <h3 className="font-bold">Balance</h3>
        <p>
          {walletInfo.assets.native.balance?.formatted || "0"}{" "}
          {walletInfo.assets.native.balance?.symbol}
        </p>
      </div>

      {walletInfo.assets.tokens.length > 0 && (
        <div>
          <h3 className="font-bold">Tokens</h3>
          <ul className="space-y-2">
            {walletInfo.assets.tokens.map((token) => (
              <li key={token.address} className="flex justify-between">
                <span>{token.symbol}</span>
                <span>{token.balance?.formatted || "0"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
