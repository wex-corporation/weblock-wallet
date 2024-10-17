import React, { useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
// import { walletState } from '../../atom/WalletAtom'
import { loginState } from '../atom/LoginAtom'
import { AlWalletSDK } from '@alwallet/sdk'
// import { blockchainsState } from '../../atom/BlockchainsAtom'
import { errorState } from '../atom/ErrorAtom'
// import BlockchainDropdown from '../dropdown/BlockchainDropdown'
// import { coinsState } from '../../atom/CoinsAtom'
// import LoginButton from '../components/button/LoginButton.tsx'
import { useNavigate } from 'react-router-dom'
import { balanceState } from '../atom/BalanceAtom.ts'

const LoginSection: React.FC<{ sdk: AlWalletSDK }> = ({ sdk }) => {
  // const [isLoggedIn, setIsLoggedIn] = useRecoilState(loginState)
  // const isLoggedIn = useRecoilValue(loginState)
  const setIsLoggedIn = useSetRecoilState(loginState)
  const [isDoneLoginWithGoogle, setIsDoneLoginWithGoogle] = useState(false)
  // const [wallet, setWallet] = useRecoilState(walletState)
  const [userPassword, setUserPassword] = useState('')
  const [walletRecovered, setWalletRecovered] = useState<boolean>(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false)
  const setError = useSetRecoilState(errorState)
  const setBalance = useSetRecoilState(balanceState)
  // const setBlockchains = useSetRecoilState(blockchainsState)
  const navigate = useNavigate()

  // 컴포넌트가 마운트될 때 로그인 상태를 확인합니다.
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const loggedIn = await sdk.auth.isLoggedIn()
        // setIsLoggedIn(loggedIn)
        console.log('로그인 상태 확인:', loggedIn)
      } catch (e) {
        setError(`로그인 상태 확인 오류: ${(e as Error).message}`)
      }
    }
    checkLoginStatus()
  }, [sdk])

  // Google 로그인 핸들러
  const handleLogin = async () => {
    try {
      // login
      await sdk.auth.signInWithGoogle()
      // setIsLoggedIn(true)
      setIsDoneLoginWithGoogle(true)

      // retrieve wallet without password
      // await core.retrieveWallet()
      // setBlockchains(await core.getBlockchains())
      setUserPassword('')
      setError('')
      // setWallet(core.getWallet()!)
      setIsPasswordModalOpen(true)
      setIsLoggedIn(true)
    } catch (e) {
      if (e instanceof Error) {
        if (
          e.message === 'User password needs to be provided' ||
          e.message === 'Must provide userPassword for new user'
        ) {
          // if password needed, open password modal
          setIsPasswordModalOpen(true)
          return
        }
        setError(e.message)
      }
    }
  }

  // 지갑 복구 핸들러
  const handleWalletRecovery = async () => {
    if (!sdk) return
    if (!userPassword) {
      setError('비밀번호를 입력해주세요')
      return
    }
    try {
      await sdk.wallets.retrieveWallet(userPassword) // 비밀번호로 지갑 복구
      // 복구된 지갑의 잔액을 조회
      const chainId = 1 // 예시로 Ethereum 메인넷(1) 체인 아이디 사용
      const balance = await sdk.wallets.getBalance(chainId)
      setBalance(balance)

      setWalletRecovered(true)
      setError('') // 에러 초기화
      setIsLoggedIn(true)
      setUserPassword('')
      setIsPasswordModalOpen(false) // 비밀번호 모달 닫기
      navigate('/wallet')
    } catch (e) {
      setError(`지갑 복구 실패: ${(e as Error).message}`)
    }
  }

  const handleGetWallet = async (event: any) => {
    event.preventDefault()

    if (!userPassword) {
      setError('User password needs to be provided')
    }
    try {
      if (isDoneLoginWithGoogle && userPassword) {
        // await core.retrieveWallet(userPassword)
        await handleWalletRecovery()
        // setBlockchains(await core.getBlockchains())
        // setWallet(core.getWallet()!)

        // setUserPassword('')
        // setError('')
        // setWalletRecovered(true)
        // setIsPasswordModalOpen(false)
        // setIsLoggedIn(true)
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message)
      }
    }
  }

  return isDoneLoginWithGoogle ? (
    isPasswordModalOpen && (
      <>
        <form
          id="submit-to-google-sheet-phone"
          className="max-w-4xl flex flex-col items-start space-y-4"
          onSubmit={handleGetWallet}
        >
          <div className="w-full md:w-96 relative">
            <input
              type="password"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && handleGetWallet}
              placeholder="User Wallet Password"
              className="w-full px-4 pr-32 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="absolute right-0 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Confirm
            </button>
          </div>
        </form>

        {/*<button onClick={handleLogout}>로그아웃</button>*/}
      </>
    )
  ) : (
    <div className={'flex flex-col items-center justify-center gap-2 w-full'}>
      <button
        onClick={handleLogin}
        className="w-full md:w-3/12 flex items-center gap-3 px-4 py-2 bg-white font-bold text-gray-700 border border-gray-300 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        <img
          src="/social-google.svg"
          alt="Google Logo"
          className="w-5 h-5 mr-2"
        />
        Google 아이디로 로그인
      </button>
    </div>
  )
}

export default LoginSection
