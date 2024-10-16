import { Routes, Route } from 'react-router-dom'
import MainPage from '../pages/MainPage'
import WalletPage from '../pages/WalletPage.tsx'

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/wallet" element={<WalletPage />} />
    </Routes>
  )
}

export default Router
