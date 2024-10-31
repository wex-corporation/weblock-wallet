// src/components/TransactionModal.tsx
import React, { useState, useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'
import { createPortal } from 'react-dom'
import { useWalletSdk } from '../context/WalletSdkContext'

interface TransactionModalProps {
  onClose: () => void
  selectedNetworkId: string
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  onClose,
  selectedNetworkId
}) => {
  const { walletSdk } = useWalletSdk()
  const [recipientAddress, setRecipientAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const handleTransaction = async () => {
    if (!walletSdk) return
    setLoading(true)
    setError('')

    try {
      // TODO: Uncomment when sendTransaction is implemented in the SDK
      // await walletSdk.sendTransaction(selectedNetworkId, recipientAddress, amount)
      alert('송금이 완료되었습니다!')
      handleClose()
    } catch (e) {
      setError('송금에 실패했습니다. 입력 값을 확인하세요.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const modalContent = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-md"
        onClick={handleClose}
      />

      <div
        className={`relative bg-white p-6 rounded-lg shadow-lg max-w-sm w-full transform transition-all duration-300 ${
          isVisible ? 'scale-100' : 'scale-90'
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <FaTimes size={20} />
        </button>
        <h2 className="text-xl font-semibold text-indigo-700 mb-4">송금</h2>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="space-y-4">
          <label className="block text-gray-600 text-sm font-medium">
            받는 주소
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="받는 주소를 입력하세요"
              className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <label className="block text-gray-600 text-sm font-medium">
            송금 금액
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="송금 금액을 입력하세요"
              className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>
        </div>

        <button
          onClick={handleTransaction}
          className={`w-full py-2 mt-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? '송금 중...' : '송금하기'}
        </button>
      </div>
    </div>
  )

  return createPortal(modalContent, document.getElementById('modal-root')!)
}

export default TransactionModal
