import { useState } from "react";
import { useWallet } from "../contexts/WalletContext";
import { SignInStatus } from "@wefunding-dev/wallet";

export function WalletConnect() {
  const {
    createWallet,
    retrieveWallet,
    isConnected,
    isLoggedIn,
    error,
    clearError,
  } = useWallet();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWallet = async () => {
    if (!password || password !== confirmPassword) {
      return;
    }
    await createWallet(password);
    setPassword("");
    setConfirmPassword("");
  };

  const handleRetrieveWallet = async () => {
    if (!password) return;
    await retrieveWallet(password);
    setPassword("");
  };

  if (!isLoggedIn) {
    return null;
  }

  if (isConnected) {
    return <div>Wallet Connected</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          className="w-full p-2 border rounded"
        />
        {isCreating && (
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="w-full p-2 border rounded"
          />
        )}
      </div>

      <div className="space-x-2">
        <button
          onClick={() => {
            setIsCreating(true);
            if (isCreating) handleCreateWallet();
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isCreating ? "Create Wallet" : "New Wallet"}
        </button>
        {!isCreating && (
          <button
            onClick={handleRetrieveWallet}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Retrieve Wallet
          </button>
        )}
        {isCreating && (
          <button
            onClick={() => {
              setIsCreating(false);
              setPassword("");
              setConfirmPassword("");
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div className="text-red-500 cursor-pointer" onClick={clearError}>
          {error}
        </div>
      )}
    </div>
  );
}
