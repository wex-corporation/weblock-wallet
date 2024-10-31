// src/App.tsx
import React, { useState } from 'react'
import { useWalletSdk } from './context/WalletSdkContext'
import ButtonSection from './components/ButtonSection'
import WalletSection from './components/WalletSection'
import ResultSection from './components/ResultSection'
import TransactionSection from './components/TransactionSection'
import { useRecoilValue } from 'recoil'
import { loginState } from './state/loginState'

const App: React.FC = () => {
  const { isInitialized } = useWalletSdk()
  const isLoggedIn = useRecoilValue(loginState)
  const [isWalletRecovered, setIsWalletRecovered] = useState(false)

  // 지갑 복구 완료 시 호출되는 함수
  const handleWalletRecovered = () => {
    setIsWalletRecovered(true)
  }

  const getMessage = () => {
    if (!isLoggedIn) {
      return '지갑을 관리하려면 먼저 SNS로그인을 진행해주세요.'
    } else if (isLoggedIn && !isWalletRecovered) {
      return '지갑 복구를 위해 비밀번호를 입력해주세요.'
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex flex-col items-center py-16 px-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          지갑 샘플(SDK 적용)
        </h1>
        {getMessage() && <p className="text-gray-600 mb-6">{getMessage()}</p>}
        {isInitialized ? (
          <div className="space-y-6">
            {/* 지갑 복구 완료 시만 하위 섹션 표시 */}
            <ButtonSection onWalletRecovered={handleWalletRecovered} />
            {isLoggedIn && isWalletRecovered && (
              <div className="bg-white mt-1 p-6 rounded-xl shadow-inner space-y-2 border border-gray-200">
                <WalletSection />
                <ResultSection />
              </div>
            )}
          </div>
        ) : (
          <p className="text-lg text-gray-500">로딩 중...</p>
        )}
      </div>

      {/* 모달 포탈 루트 */}
      <div id="modal-root"></div>
    </div>
  )
}

export default App
