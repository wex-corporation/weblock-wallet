``` typescript
// QuickStart 사용 예시 (React 프로젝트)
import React, { useEffect, useState } from 'react'
import WalletSdk from 'wallet-sdk'

const config = {
  apiBaseUrl: 'http://localhost:8080',
  firebaseConfig: {
    apiKey: 'YOUR_FIREBASE_API_KEY',
    authDomain: 'YOUR_FIREBASE_AUTH_DOMAIN',
    projectId: 'YOUR_FIREBASE_PROJECT_ID',
    storageBucket: 'YOUR_FIREBASE_STORAGE_BUCKET',
    messagingSenderId: 'YOUR_FIREBASE_SENDER_ID',
    appId: 'YOUR_FIREBASE_APP_ID',
    measurementId: 'YOUR_MEASUREMENT_ID'
  }
}

WalletSdk.initialize(config, 'YOUR_API_KEY', 'YOUR_ORG_HOST')

function App() {
  const sdk = WalletSdk.getInstance()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [wallet, setWallet] = useState(null)
  const [password, setPassword] = useState("")

  useEffect(() => {
    // 초기화된 SDK를 통해 필요할 때 호출
  }, [])

  const handleLogin = async () => {
    try {
      await sdk.signInWithGoogle()
      setIsLoggedIn(true)
      alert("로그인 성공!")
    } catch (error) {
      console.error("로그인 실패:", error)
    }
  }

  const handleRetrieveWallet = async () => {
    try {
      await sdk.retrieveWallet(password)
      setWallet(sdk.getWallet())
      alert("지갑 복구 성공!")
    } catch (error) {
      console.error("지갑 복구 실패:", error)
    }
  }

  return (
    <div>
      <h1>Wallet SDK Demo</h1>
      {!isLoggedIn ? (
        <button onClick={handleLogin}>Google 로그인</button>
      ) : (
        <>
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleRetrieveWallet}>지갑 복구</button>
        </>
      )}
      {wallet && <div>Wallet Address: {wallet.address}</div>}
    </div>
  )
}
export default App

```
### Quick Start 사용 예시 (React 프로젝트트