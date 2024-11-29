'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { WalletSDK, WalletSDKConfig } from '@wefunding-dev/wallet-sdk'

// SDKContext 타입 정의
interface SDKContextType {
  sdk: WalletSDK | null
  isInitialized: boolean
  initializeSDK: (config: WalletSDKConfig) => void
}

// 기본값 설정
const SDKContext = createContext<SDKContextType | undefined>(undefined)

// SDKProvider 컴포넌트
export const SDKProvider = ({ children }: { children: ReactNode }) => {
  const [sdk, setSDK] = useState<WalletSDK | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // SDK 초기화 메서드
  const initializeSDK = (config: WalletSDKConfig) => {
    try {
      const sdkInstance = new WalletSDK()
      sdkInstance.initialize(config)
      setSDK(sdkInstance)
      setIsInitialized(true)
      console.log('[SDKProvider] SDK 초기화 성공:', sdkInstance)
    } catch (error) {
      console.error('[SDKProvider] SDK 초기화 실패:', error)
    }
  }

  return (
    <SDKContext.Provider value={{ sdk, isInitialized, initializeSDK }}>
      {children}
    </SDKContext.Provider>
  )
}

// 커스텀 훅: SDKContext 사용
export const useSDK = (): SDKContextType => {
  const context = useContext(SDKContext)
  if (!context) {
    throw new Error('useSDK must be used within an SDKProvider')
  }
  return context
}
