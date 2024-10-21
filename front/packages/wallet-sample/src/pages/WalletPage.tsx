import React, { useEffect, useState } from 'react'
import { WalletManager } from '@alwallet/sdk2' // SDK2에서 WalletManager를 import

const WalletPage: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)

  const walletManager = new WalletManager(
    'local',
    'MCowBQYDK2VwAyEASXmv-39yF5Wx1vX9lPuP7_9qgWVeGXMdAWr-TKalKMw=',
    'http://localhost:3000'
  )

  // 지갑 생성 및 조회
  const createWallet = async () => {
    try {
      await walletManager.createWallet('userPassword') // 사용자 비밀번호로 지갑 생성
      const address = walletManager.getWalletAddress()
      setWalletAddress(address)

      if (address) {
        const fetchedBalance = await walletManager.getBalance(1) // 예: Ethereum Mainnet의 Chain ID는 1
        setBalance(fetchedBalance)
      }
    } catch (error) {
      console.error('Error creating wallet:', error)
    }
  }

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-3xl font-bold text-center">Wallet Information</h1>
      <button
        className="mt-4 bg-green-500 text-white p-2 rounded mx-auto block"
        onClick={createWallet}
      >
        Create Wallet
      </button>
      <div className="mt-4 text-center">
        <p>
          <strong>Address:</strong> {walletAddress || 'No wallet created yet'}
        </p>
        <p>
          <strong>Balance:</strong> {balance || 'No balance available'}
        </p>
      </div>
    </div>
  )
}

export default WalletPage
