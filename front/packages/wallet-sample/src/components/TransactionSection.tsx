// src/components/TransactionSection.tsx
import React, { useState } from 'react'
import { useWalletSdk } from '../context/WalletSdkContext'
import { useRecoilValue } from 'recoil'
import { walletState } from '../state/walletState'

const TransactionSection: React.FC = () => {
  const { walletSdk, isInitialized } = useWalletSdk()
  const wallet = useRecoilValue(walletState) // 현재 지갑 상태 가져오기
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendTransaction = async () => {
    if (!isInitialized || !walletSdk) {
      setError('WalletSdk가 초기화되지 않았습니다.')
      return
    }

    if (!toAddress || !amount) {
      setError('받는 주소와 금액을 입력하세요.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 트랜잭션 전송 (단순 예시이므로 chainId와 coin 정보를 하드코딩)
      // await walletSdk.sendTransaction(1, {
      //   amount,
      //   to: toAddress,
      //   coin: { symbol: 'ETH', name: 'Ethereum', decimals: 18 } // 임의의 코인 정보
      // })
      console.log('트랜잭션 로그만 남기기')
      alert('트랜잭션 전송 성공 🎉')
    } catch (e) {
      setError('트랜잭션 전송에 실패했습니다.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 text-center p-4 border rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-bold text-gray-700 mb-4">트랜잭션 전송</h2>

      <input
        type="text"
        placeholder="받는 주소"
        value={toAddress}
        onChange={(e) => setToAddress(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
      />

      <input
        type="text"
        placeholder="금액"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
      />

      <button
        onClick={handleSendTransaction}
        className={`w-full py-2 rounded-lg text-white font-semibold transition ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
        }`}
        disabled={loading || !toAddress || !amount}
      >
        {loading ? '전송 중...' : '트랜잭션 전송'}
      </button>

      {error && (
        <div className="text-red-500 font-semibold mt-2">
          {error}
        </div>
      )}
    </div>
  )
}

export default TransactionSection
