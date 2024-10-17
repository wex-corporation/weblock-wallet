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

const WalletPage: React.FC<{ sdk: AlWalletSDK }> = ({ sdk }) => {
  const [balance, setBalance] = useRecoilState(balanceState)
  const isLoggedIn = useRecoilValue(loginState)
  const navigate = useNavigate()
  const setError = useSetRecoilState(errorState)
  const setIsLoggedIn = useSetRecoilState(loginState)
  const [walletAddress, setWalletAddress] = useState('')
  const selectedBlockchain = useRecoilValue(blockchainState)

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
      await sdk.auth.signOut()
      setIsLoggedIn(false)
      setError('') // 에러 초기화
      navigate('/')
    } catch (e) {
      setError(`로그아웃 실패: ${(e as Error).message}`)
    }
  }

  // 잔액 조회 핸들러
  const handleCheckBalance = async () => {
    if (!sdk) return

    const chainId = selectedBlockchain!.chainId
    if (!chainId) return

    try {
      const fetchedBalance = await sdk.wallets.getBalance(chainId)
      setBalance(Numbers.weiToEth(Numbers.hexToDecimal(fetchedBalance)))
      setError('')
    } catch (e) {
      setError(`잔액 조회 실패: ${(e as Error).message}`)
    }
  }

  return (
    isLoggedIn && (
      <>
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-bold text-center">
            Wallet Address : {walletAddress}
          </h3>
          {balance && (
            <p className="text-xl font-bold">Balance : {balance} ETH</p>
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
            <CoinDropdown />

            <div className="flex flex-col gap-2 w-full items-center">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">To Address</label>
                <input
                  type="text"
                  placeholder="To Address"
                  className="min-w-[300px] w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Amount</label>
                <input
                  type="text"
                  placeholder="Amount"
                  className="min-w-[300px] w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="min-w-[300px] px-4 py-2 bg-blue-500 text-white rounded-md mb-2">
                Send Transaction
              </button>
            </div>
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
