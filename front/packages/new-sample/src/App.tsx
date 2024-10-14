import { useState } from 'react';
import { AlWalletSDK } from '@alwallet/sdk'; // SDK 임포트

const sdk = new AlWalletSDK({
  baseUrl: 'local',
  apiKey: 'MCowBQYDK2VwAyEASXmv-39yF5Wx1vX9lPuP7_9qgWVeGXMdAWr-TKalKMw=',
  orgHost: 'http://localhost:5137'
})

function App() {
  const [balance, setBalance] = useState<string | null>(null);

  const handleCreateWallet = async () => {
    try {
      await sdk.createWallet('user-password'); // 지갑 생성
      alert('Wallet created successfully!');
    } catch (error) {
      console.error('Failed to create wallet:', error);
    }
  };

  const handleGetBalance = async () => {
    try {
      const balance = await sdk.getBalance(1); // Chain ID 1 (예: Ethereum Mainnet)
      setBalance(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">AlWallet SDK Demo</h1>

      <button
        onClick={handleCreateWallet}
        className="px-4 py-2 bg-blue-500 text-white rounded-md mb-2"
      >
        Create Wallet
      </button>

      <button
        onClick={handleGetBalance}
        className="px-4 py-2 bg-green-500 text-white rounded-md"
      >
        Get Balance
      </button>

      {balance && <p className="mt-4 text-xl">Balance: {balance}</p>}
    </div>
  );
}

export default App;
