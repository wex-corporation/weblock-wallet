import React from 'react'
import { RecoilRoot } from 'recoil'
import WalletSection from '../section/WalletSection'
import ButtonSection from '../section/ButtonSection'
import { Core } from '@alwallet/core'
import './../style/Style.css'
import ResultSection from '../section/ResultSection'

const MainPage = () => {
  const core = new Core(
    'local',
    'MCowBQYDK2VwAyEASXmv-39yF5Wx1vX9lPuP7_9qgWVeGXMdAWr-TKalKMw=',
    'http://localhost:3000'
  )

  return (
    <div className="main-page">
      <RecoilRoot>
        <div className="section">
          <WalletSection core={core} />
        </div>
        <div className="section">
          <ResultSection core={core} />
        </div>
        <div className="section">
          <ButtonSection core={core} />
        </div>
      </RecoilRoot>
    </div>
  )
}

export default MainPage
