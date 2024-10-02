import React from 'react'
import { Core } from '@alwallet/core'
import LoginButton from '../component/button/LoginButton'
import LogoutButton from '../component/button/LogoutButton'
import BlockchainDropdown from '../component/dropdown/BlockchainDropdown'
import GetBalanceButton from '../component/button/GetBalanceButton'
import SendCoinButton from '../component/button/SendCoinButton'
import './../style/Style.css'
import CoinDropdown from '../component/dropdown/CoinDropdown'
import RegisterTokenButton from '../component/button/RegisterTokenButton'

interface ButtonSectionProps {
  core: Core
}

const ButtonSection: React.FC<ButtonSectionProps> = ({ core }) => {
  return (
    <div className="button-section">
      <h2>Function Section</h2>
      <LoginButton core={core} />
      <GetBalanceButton core={core} />
      <RegisterTokenButton core={core} />
      <SendCoinButton core={core} />
      <LogoutButton core={core} />
    </div>
  )
}

export default ButtonSection
