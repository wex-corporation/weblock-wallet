// src/components/TokenModal.tsx
import React, { useState, useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'
import ReactDOM from 'react-dom'
import { useWalletSdk } from '../context/WalletSdkContext'

interface TokenModalProps {
  onClose: () => void
  onTokenRegistered: () => void
  networkId: string
}

const TokenModal: React.FC<TokenModalProps> = ({
  onClose,
  onTokenRegistered,
  networkId
}) => {
  const { walletSdk } = useWalletSdk()
  const [tokenAddress, setTokenAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const handleRegisterToken = async () => {
    if (!walletSdk) return

    setLoading(true)
    setError(null)

    try {
      await walletSdk
        .getUsersModule()
        .registerToken(networkId, tokenAddress, 'TokenName', 'SYM', 18)
      onTokenRegistered()
      handleClose()
    } catch (err) {
      setError('토큰 등록에 실패했습니다. 주소를 확인해주세요.')
      console.error(err)
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
        <h2 className="text-xl font-semibold text-gray-800 mb-4">토큰 등록</h2>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            토큰 주소
          </label>
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0x..."
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          onClick={handleRegisterToken}
          disabled={loading || !tokenAddress}
          className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-300"
        >
          {loading ? '등록 중...' : '토큰 등록'}
        </button>
      </div>
    </div>
  )

  return ReactDOM.createPortal(
    modalContent,
    document.getElementById('modal-root')!
  )
}

export default TokenModal
