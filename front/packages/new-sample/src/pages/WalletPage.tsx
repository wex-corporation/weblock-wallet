import React, { useEffect, useState } from 'react'
import { AlWalletSDK, Numbers } from '@alwallet/sdk'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { loginState } from '../atom/LoginAtom.ts'
import BlockchainDropdown from '../components/dropdown/BlockchainDropdown.tsx'
import CoinDropdown from '../components/dropdown/CoinDropdown.tsx'
import RegisterTokenButton from '../components/button/RegisterTokenButton.tsx'
import { useNavigate } from 'react-router-dom'
import { errorState } from '../atom/ErrorAtom.ts'
import { balanceState } from '../atom/BalanceAtom.ts'
import { blockchainState } from '../atom/BlockchainAtom.ts'
import SendCoinButton from '../components/button/SendCoinButton.tsx'
import { resultState } from '../atom/ResultAtom.ts'
import { txStatusState } from '../atom/TxStatusAtom.ts'
import { loadingState } from '../atom/LoadingAtom.ts'

const WalletPage: React.FC<{ sdk: AlWalletSDK }> = ({ sdk }) => {
  const [balance, setBalance] = useRecoilState(balanceState)
  const isLoggedIn = useRecoilValue(loginState)
  const navigate = useNavigate()
  const setError = useSetRecoilState(errorState)
  const setIsLoggedIn = useSetRecoilState(loginState)
  const [walletAddress, setWalletAddress] = useState('')
  const selectedBlockchain = useRecoilValue(blockchainState)
  const result = useRecoilValue(resultState)
  const status = useRecoilValue(txStatusState)
  const setLoading = useSetRecoilState(loadingState)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/')
    }
    const address = sdk.wallets.getWalletAddress()
    setWalletAddress(address!)
  }, [])

  // useEffect(() => {
  //   handleCheckBalance()
  // }, [selectedBlockchain])

  // 로그아웃 핸들러
  const handleLogout = async () => {
    if (!sdk) return
    try {
      setLoading(true)
      await sdk.auth.signOut()
      setIsLoggedIn(false)

      setError('') // 에러 초기화
      setLoading(false)
      navigate('/')
    } catch (e) {
      setLoading(false)
      setError(`로그아웃 실패: ${(e as Error).message}`)
    }
  }

  // 잔액 조회 핸들러
  const handleCheckBalance = async () => {
    if (!sdk) return

    const chainId = selectedBlockchain!.chainId
    if (!chainId) return

    try {
      setLoading(true)
      const fetchedBalance = await sdk.wallets.getBalance(chainId)
      setBalance(Numbers.weiToEth(Numbers.hexToDecimal(fetchedBalance)))
      setError('')
      setLoading(false)
    } catch (e) {
      setLoading(false)
      setError(`잔액 조회 실패: ${(e as Error).message}`)
    }
  }

  return (
    isLoggedIn && (
      <>
        <div className="flex flex-col gap-2">
          <h3 className="text-xl">
            <span className="font-bold">Wallet Address :</span> {walletAddress}
          </h3>
          {balance && (
            <p className="text-xl">
              <span className="font-bold">Balance :</span> {balance} ETH
            </p>
          )}

          {result && (
            <p className="text-xl">
              <span className="font-bold">Result :</span> {result}
            </p>
          )}
          {status && (
            <p className="text-xl">
              <span className="font-bold">Status :</span> {status}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-16">
          <div className="flex flex-col gap-2 w-full items-center">
            <BlockchainDropdown sdk={sdk} />
            <button
              onClick={handleCheckBalance}
              className="min-w-[300px] px-4 py-2 bg-green-500 text-white rounded-md"
            >
              Get Balance
            </button>
          </div>

          <RegisterTokenButton sdk={sdk} />

          <div className="flex flex-col gap-8 w-full items-center">
            <CoinDropdown sdk={sdk} />
            <SendCoinButton sdk={sdk} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-400 text-white rounded-md mb-2"
          >
            Logout
          </button>
        </div>
      </>
    )
  )
}

export default WalletPage
