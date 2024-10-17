import { Routes, Route } from 'react-router-dom'
import MainPage from '../pages/MainPage'
import WalletPage from '../pages/WalletPage.tsx'
import { AlWalletSDK } from '@alwallet/sdk'

const sdk = new AlWalletSDK({
  env: 'local', // 'local', 'dev', 'stage', 'prod' 중 선택
  apiKey: 'MCowBQYDK2VwAyEASXmv-39yF5Wx1vX9lPuP7_9qgWVeGXMdAWr-TKalKMw=', // 임시 API 키
  orgHost: 'http://localhost:3000' // 조직 호스트 설정
})

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<MainPage sdk={sdk} />} />
      <Route path="/wallet" element={<WalletPage sdk={sdk} />} />
    </Routes>
  )
}

export default Router
