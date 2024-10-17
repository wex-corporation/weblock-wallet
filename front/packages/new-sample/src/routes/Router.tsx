import { Routes, Route } from 'react-router-dom'
import MainPage from '../pages/MainPage'
import WalletPage from '../pages/WalletPage.tsx'
import { AlWalletSDK } from '@alwallet/sdk'
import { useEffect, useState } from 'react'
import { useSetRecoilState } from 'recoil'
import { errorState } from '../atom/ErrorAtom.ts'

const Router = () => {
  const [sdk, setSdk] = useState<AlWalletSDK | null>(null) // SDK 인스턴스
  const setError = useSetRecoilState(errorState)

  useEffect(() => {
    // SDK 초기화 및 로그인 상태 확인
    const initializeSDK = async () => {
      try {
        const walletSdk = new AlWalletSDK({
          env: 'local', // 환경 설정 (local, dev, stage, prod)
          apiKey:
            'MCowBQYDK2VwAyEASXmv-39yF5Wx1vX9lPuP7_9qgWVeGXMdAWr-TKalKMw=', // 임시 API 키
          orgHost: 'http://localhost:3000' // 조직 호스트 설정
        })
        setSdk(walletSdk)

        // 로그인 상태 확인
        const loggedIn = await walletSdk.auth.isLoggedIn()
        console.log(
          loggedIn
            ? '로그인 상태 확인: 로그인됨'
            : '로그인 상태 확인: 로그인 안됨'
        )
      } catch (e) {
        setError(`SDK 초기화 중 오류가 발생했습니다: ${(e as Error).message}`)
      }
    }

    initializeSDK()
  }, [])
  return (
    sdk && (
      <Routes>
        <Route path="/" element={<MainPage sdk={sdk} />} />
        <Route path="/wallet" element={<WalletPage sdk={sdk} />} />
      </Routes>
    )
  )
}

export default Router
