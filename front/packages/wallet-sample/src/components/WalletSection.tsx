// src/components/WalletSection.tsx
import React, { useState } from 'react'
import { useRecoilValue } from 'recoil'
import { walletState } from '../state/walletState'
import { useWalletSdk } from '../context/WalletSdkContext'

const WalletSection: React.FC = () => {
  const wallet = useRecoilValue(walletState)
  const { walletSdk } = useWalletSdk()
  const [balance, setBalance] = useState<string | null>(null)

  // 잔액 조회 핸들러
  const handleCheckBalance = async () => {
    if (walletSdk) {
      const balanceResult = await walletSdk.getBalance(1) // 예: 체인 ID 1 사용
      setBalance(balanceResult)
    }
  }

  // 지갑 주소 복사 핸들러
  const handleCopyAddress = () => {
    if (wallet) {
      navigator.clipboard.writeText(wallet.address)
      alert('지갑 주소가 복사되었습니다!')
    }
  }

  return (
    <div className="wallet-section bg-white bg-opacity-20 backdrop-blur-lg p-6 rounded-xl shadow-md max-w-sm mx-auto text-center">
      <h2 className="text-2xl font-semibold text-indigo-700">지갑 정보</h2>

      {wallet ? (
        <div className="mt-4 space-y-3">
          <div
            onClick={handleCopyAddress}
            className="cursor-pointer bg-white bg-opacity-50 p-3 rounded-lg shadow-inner"
          >
            <p className="text-gray-700 font-medium">지갑 주소</p>
            <p className="text-gray-900 font-semibold text-sm break-all">
              {wallet.address}
            </p>
            <p className="text-xs text-indigo-500">(클릭하여 복사)</p>
          </div>
          <div className="bg-white bg-opacity-50 p-3 rounded-lg shadow-inner">
            <p className="text-gray-700 font-medium">Public Key</p>
            <p className="text-gray-900 font-semibold text-sm break-all">
              {wallet.publicKey}
            </p>
          </div>

          {balance && (
            <div className="bg-white bg-opacity-50 p-3 rounded-lg shadow-inner">
              <p className="text-gray-700 font-medium">잔액</p>
              <p className="text-gray-900 font-semibold text-sm">
                {balance} ETH
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-600 mt-4">지갑 정보가 없습니다.</p>
      )}

      {/* 잔액 조회 버튼 */}
      <button
        onClick={handleCheckBalance}
        className="mt-6 px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition"
      >
        잔액 조회
      </button>
    </div>
  )
}

export default WalletSection
