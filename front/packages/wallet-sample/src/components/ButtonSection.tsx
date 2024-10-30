// src/components/ButtonSection.tsx
import React, { useState } from 'react'
import { useWalletSdk } from '../context/WalletSdkContext'
import { useSetRecoilState } from 'recoil'
import { loginState } from '../state/loginState'
import { walletState } from '../state/walletState'
import { Wallet as EthersWallet } from 'ethers'
import { Wallet } from 'wallet-sdk'

interface ButtonSectionProps {
  onWalletRecovered: () => void // 지갑 복구 완료 시 호출할 함수
}

const ButtonSection: React.FC<ButtonSectionProps> = ({ onWalletRecovered }) => {
  const { walletSdk, isInitialized } = useWalletSdk()
  const setLoggedIn = useSetRecoilState(loginState)
  const setWallet = useSetRecoilState(walletState)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isWalletInitialized, setIsWalletInitialized] = useState(false)

  // 구글 로그인 처리
  const handleGoogleLogin = async () => {
    if (!isInitialized || !walletSdk) {
      setError('Wallet SDK가 초기화되지 않았습니다.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await walletSdk.signInWithGoogle()
      setLoggedIn(true)
      alert('로그인 성공!')

      // 비밀번호 입력창을 열기
      setIsPasswordModalOpen(true)
    } catch (e) {
      setError('로그인에 실패했습니다. 다시 시도해주세요.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // 지갑 복구 처리
  const handleWalletRetrieve = async () => {
    if (!isInitialized || !walletSdk) {
      setError('Wallet SDK가 초기화되지 않았습니다.')
      return
    }

    if (!password) {
      setError('비밀번호를 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await walletSdk.retrieveWallet(password)
      const retrievedWallet = walletSdk.getWallet() as EthersWallet
      const transformedWallet: Wallet = {
        id: '',
        userId: '',
        address: retrievedWallet.address,
        publicKey: retrievedWallet.signingKey.publicKey,
        share1: '',
        encryptedShare3: ''
      }

      setWallet(transformedWallet)
      setIsWalletInitialized(true)
      setIsPasswordModalOpen(false)
      alert('지갑 복구/생성 성공!')

      // 지갑 복구 완료 시 상위 컴포넌트에 알림
      onWalletRecovered()
    } catch (e) {
      setError('지갑 복구/생성에 실패했습니다. 비밀번호를 확인해주세요.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // 로그아웃 처리
  const handleLogout = async () => {
    if (!walletSdk) return

    setLoading(true)
    setError('')

    try {
      await walletSdk.signOut()
      setLoggedIn(false)
      setWallet(null) // 지갑 상태 초기화
      setIsWalletInitialized(false) // 지갑 초기화 상태
      setIsPasswordModalOpen(false) // 비밀번호 모달 초기화
      alert('로그아웃 성공!')
    } catch (e) {
      setError('로그아웃에 실패했습니다.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg space-y-6 max-w-md mx-auto mt-8">
      {/* 에러 메시지 */}
      {error && (
        <div className="text-red-600 font-semibold text-center bg-red-100 p-2 rounded-md">
          {error}
        </div>
      )}

      {/* 로그인 전: 구글 로그인 버튼 */}
      {!isWalletInitialized && !isPasswordModalOpen && (
        <button
          onClick={handleGoogleLogin}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          disabled={loading}
        >
          {loading ? '로그인 중...' : '구글 ID로 로그인'}
        </button>
      )}

      {/* 로그인 후: 비밀번호 입력 및 지갑 복구 */}
      {isPasswordModalOpen && (
        <div className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 입력"
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleWalletRetrieve}
            className="w-full py-3 bg-gradient-to-r from-green-400 to-green-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            disabled={loading}
          >
            {loading ? '지갑 복구 중...' : '지갑 복구/생성'}
          </button>
        </div>
      )}

      {/* 지갑 복구 후: 로그아웃 버튼 */}
      {isWalletInitialized && (
        <button
          onClick={handleLogout}
          className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          disabled={loading}
        >
          {loading ? '로그아웃 중...' : '로그아웃'}
        </button>
      )}
    </div>
  )
}

export default ButtonSection
