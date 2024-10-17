import { AlWalletSDK } from '@alwallet/sdk'
import LoginSection from '../sections/LoginSection.tsx'
import React from 'react'

const MainPage: React.FC<{ sdk: AlWalletSDK }> = ({ sdk }) => {
  return <LoginSection sdk={sdk} />
}

export default MainPage
