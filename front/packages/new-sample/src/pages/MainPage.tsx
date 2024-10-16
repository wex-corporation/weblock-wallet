import { useState } from 'react'
import { AlWalletSDK } from '@alwallet/sdk'
import { useRecoilState } from 'recoil'
import { loginState } from '../atom/LoginAtom.ts'
import LoginSection from '../sections/LoginSection.tsx'

const sdk = new AlWalletSDK({
  env: 'local', // 'local', 'dev', 'stage', 'prod' 중 선택
  apiKey: 'MCowBQYDK2VwAyEASXmv-39yF5Wx1vX9lPuP7_9qgWVeGXMdAWr-TKalKMw=', // 임시 API 키
  orgHost: 'http://localhost:3000' // 조직 호스트 설정
})

export default function MainPage() {
  // const [balance, setBalance] = useState<string | null>(null)
  // const [isLoggedIn, setLoggedIn] = useRecoilState(loginState)
  //
  // const handleCreateWallet = async () => {
  //   try {
  //     await sdk.createWallet('user-password') // 지갑 생성
  //     alert('Wallet created successfully!')
  //   } catch (error) {
  //     console.error('Failed to create wallet:', error)
  //   }
  // }
  //
  // const handleGetBalance = async () => {
  //   try {
  //     const balance = await sdk.getBalance(1) // Chain ID 1 (예: Ethereum Mainnet)
  //     setBalance(balance)
  //   } catch (error) {
  //     console.error('Failed to get balance:', error)
  //   }
  // }

  return (
    // <div className="flex flex-col items-center justify-center gap-12 min-h-screen bg-gray-100 p-8">
    //   <h1 className="text-4xl font-bold text-center">RWX Wallet SDK Demo</h1>

    // <>
    //   {isLoggedIn ? (
    //     <div className="flex flex-col gap-4">
    //       <button
    //         onClick={handleCreateWallet}
    //         className="px-4 py-2 bg-blue-500 text-white rounded-md mb-2"
    //       >
    //         Create Wallet
    //       </button>
    //
    //       <button
    //         onClick={handleGetBalance}
    //         className="px-4 py-2 bg-green-500 text-white rounded-md"
    //       >
    //         Get Balance
    //       </button>
    //     </div>
    //   ) : (
    <LoginSection sdk={sdk} />
    //   )}
    //   {balance && <p className="mt-4 text-xl">Balance: {balance}</p>}
    // </>
  )
}
