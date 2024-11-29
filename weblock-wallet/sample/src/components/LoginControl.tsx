'use client'

import React, { useState } from 'react'
import { useSDK } from '../context/SDKContext'
import { AvailableProviders } from '@wefunding-dev/wallet-sdk'

const LoginControl = () => {
  const { isInitialized, sdk } = useSDK()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    if (!sdk) {
      setError('SDK가 초기화되지 않았습니다.')
      return
    }

    try {
      setError(null)
      await sdk.signInWithProvider(AvailableProviders.Google)
      const loggedIn = await sdk.isLoggedIn()
      setIsLoggedIn(loggedIn)
    } catch (err) {
      console.error('[LoginControl] 로그인 실패:', err)
      setError((err as Error)?.message || '알 수 없는 에러')
    }
  }

  const handleSignOut = async () => {
    if (!sdk) {
      setError('SDK가 초기화되지 않았습니다.')
      return
    }

    try {
      setError(null)
      await sdk.signOut()
      setIsLoggedIn(false)
    } catch (err) {
      console.error('[LoginControl] 로그아웃 실패:', err)
      setError((err as Error)?.message || '알 수 없는 에러')
    }
  }

  return (
    <div className="p-4 border rounded shadow-md bg-white w-full max-w-md">
      <h2 className="text-xl font-bold mb-2">로그인/로그아웃</h2>
      {!isInitialized && (
        <p className="text-red-500">
          SDK가 초기화되지 않았습니다. 먼저 초기화해주세요.
        </p>
      )}
      {isInitialized && (
        <>
          {!isLoggedIn ? (
            <button
              onClick={handleSignIn}
              className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
            >
              Google 로그인
            </button>
          ) : (
            <button
              onClick={handleSignOut}
              className="bg-gray-500 text-white px-4 py-2 rounded shadow hover:bg-gray-600 transition"
            >
              로그아웃
            </button>
          )}
          {error && <p className="text-red-500 mt-2">에러 발생: {error}</p>}
        </>
      )}
    </div>
  )
}

export default LoginControl
