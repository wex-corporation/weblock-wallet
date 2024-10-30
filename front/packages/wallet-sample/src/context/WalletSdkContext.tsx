// src/context/WalletSdkContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import WalletSdk, { EnvironmentConfig } from 'wallet-sdk' // SDK에서 WalletSdk 가져오기

interface WalletSdkContextType {
  walletSdk: WalletSdk | null
  isInitialized: boolean
}

const WalletSdkContext = createContext<WalletSdkContextType | undefined>(undefined)

export const WalletSdkProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [walletSdk, setWalletSdk] = useState<WalletSdk | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const envConfig: EnvironmentConfig = {
      apiBaseUrl: 'http://localhost:8080',
      firebaseConfig: {
        apiKey: 'AIzaSyDXfrpfLOiDskQEc1PEP9j5HrGCLmtddRI',
        authDomain: 'rwx-wallet.firebaseapp.com',
        projectId: 'rwx-wallet',
        storageBucket: 'rwx-wallet.appspot.com',
        messagingSenderId: '397943391932',
        appId: '1:397943391932:web:5545b196b8a027c1c172b9',
        measurementId: 'G-V5YX6ECWTT'
      }
    }

    // WalletSdk 인스턴스를 싱글톤으로 가져오기
    const sdkInstance = WalletSdk.getInstance(
      envConfig,
      'MCowBQYDK2VwAyEASXmv-39yF5Wx1vX9lPuP7_9qgWVeGXMdAWr-TKalKMw=',
      'http://localhost:3000'
    )

    setWalletSdk(sdkInstance)
    setIsInitialized(true)
  }, [])

  return (
    <WalletSdkContext.Provider value={{ walletSdk, isInitialized }}>
      {children}
    </WalletSdkContext.Provider>
  )
}

export const useWalletSdk = () => {
  const context = useContext(WalletSdkContext)
  if (!context) {
    throw new Error('useWalletSdk must be used within a WalletSdkProvider')
  }
  return context
}
