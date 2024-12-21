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
          {walletInfo.assets.native.balance} {walletInfo.assets.native.symbol}
        </p>
      </div>

      {walletInfo.assets.tokens.length > 0 && (
        <div>
          <h3 className="font-bold">Tokens</h3>
          <ul>
            {walletInfo.assets.tokens.map((token) => (
              <li key={token.address}>
                {token.balance} {token.symbol}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
