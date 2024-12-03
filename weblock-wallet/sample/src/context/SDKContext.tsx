'use client'

import React, { createContext, useContext, useState } from 'react'
import {
  WalletSDK,
  WalletSDKConfig,
  AvailableProviders
} from '@wefunding-dev/wallet-sdk'

interface SDKContextType {
  sdk: WalletSDK | null
  isInitialized: boolean
  isLoggedIn: boolean
  initializeSDK: (config: WalletSDKConfig) => void
  login: () => Promise<void>
  logout: () => Promise<void>
}

const defaultContext: SDKContextType = {
  sdk: null,
  isInitialized: false,
  isLoggedIn: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  initializeSDK: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  login: async () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  logout: async () => {}
}

const SDKContext = createContext<SDKContextType>(defaultContext)

export const useSDK = () => useContext(SDKContext)

export const SDKProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [sdk, setSdk] = useState<WalletSDK | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const initializeSDK = (config: WalletSDKConfig) => {
    if (isInitialized) {
      console.warn('[SDKContext] SDK가 이미 초기화되어 있습니다.')
      return
    }

    try {
      const newSDK = new WalletSDK()
      newSDK.initialize(config)
      setSdk(newSDK)
      setIsInitialized(true)
      console.log('[SDKContext] SDK 초기화 성공')
    } catch (error) {
      console.error('[SDKContext] SDK 초기화 실패:', error)
      throw error
    }
  }

  const login = async () => {
    if (!sdk) {
      throw new Error('SDK가 초기화되지 않았습니다.')
    }

    try {
      await sdk.signInWithProvider(AvailableProviders.Google)
      const loggedIn = await sdk.isLoggedIn()
      setIsLoggedIn(loggedIn)
      console.log('[SDKContext] 로그인 성공')
    } catch (error) {
      console.error('[SDKContext] 로그인 실패:', error)
      throw error
    }
  }

  const logout = async () => {
    if (!sdk) {
      throw new Error('SDK가 초기화되지 않았습니다.')
    }

    try {
      await sdk.signOut()
      setIsLoggedIn(false)
      console.log('[SDKContext] 로그아웃 성공')
    } catch (error) {
      console.error('[SDKContext] 로그아웃 실패:', error)
      throw error
    }
  }

  return (
    <SDKContext.Provider
      value={{
        sdk,
        isInitialized,
        isLoggedIn,
        initializeSDK,
        login,
        logout
      }}
    >
      {children}
    </SDKContext.Provider>
  )
}
