import { useState, useEffect } from 'react'
import { AuthManager, WalletManager } from '@alwallet/sdk2' // AuthManager와 WalletManager import

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)

  // AuthManager와 WalletManager 초기화
  const authManager = new AuthManager(
    'local',
    'YOUR_API_KEY',
    'http://localhost:5173'
  )
  const walletManager = new WalletManager(
    'local',
    'YOUR_API_KEY',
    'http://localhost:5173'
  )

  // Google 로그인 처리
  const handleLogin = async () => {
    try {
      await authManager.signInWithGoogle()
      setIsAuthenticated(true) // 인증 성공 시 상태 업데이트
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  // 지갑 생성 및 조회
  const handleWalletCreation = async () => {
    try {
      await walletManager.createWallet('userPassword')
      const address = walletManager.getWalletAddress()
      setWalletAddress(address)
    } catch (error) {
      console.error('Wallet creation failed:', error)
    }
  }

  // 잔액 조회
  const handleGetBalance = async () => {
    try {
      if (walletAddress) {
        const fetchedBalance = await walletManager.getBalance(1) // 예: Ethereum Mainnet (chainId: 1)
        setBalance(fetchedBalance)
      }
    } catch (error) {
      console.error('Balance retrieval failed:', error)
    }
  }

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await authManager.signOut()
      setIsAuthenticated(false)
      setWalletAddress(null)
      setBalance(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">My Wallet App</h1>

      {!isAuthenticated ? (
        <button
          onClick={handleLogin}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Sign in with Google
        </button>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-xl">Authenticated</h2>

          <button
            onClick={handleWalletCreation}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Create Wallet
          </button>

          {walletAddress && (
            <div>
              <h3>Wallet Address: {walletAddress}</h3>

              <button
                onClick={handleGetBalance}
                className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded"
              >
                Get Balance
              </button>

              {balance && <h3>Balance: {balance} ETH</h3>}
            </div>
          )}

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

export default App
