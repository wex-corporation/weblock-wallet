import React, { useState } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { walletState } from '../../atom/WalletAtom'
import { loginState } from '../../atom/LoginAtom'
import { Core } from '@alwallet/core'
import { errorState } from '../../atom/ErrorAtom'
import { blockchainsState } from '../../atom/BlockchainsAtom'
import { resultState } from '../../atom/ResultAtom'
import { coinsState } from '../../atom/CoinsAtom'

const LogoutButton: React.FC<{ core: Core }> = ({ core }) => {
  const wallet = useRecoilValue(walletState)
  const setLoggedIn = useSetRecoilState(loginState)
  const setBlockchains = useSetRecoilState(blockchainsState)
  const setCoins = useSetRecoilState(coinsState)
  const setResult = useSetRecoilState(resultState)
  const setError = useSetRecoilState(errorState)
  const setWallet = useSetRecoilState(walletState)

  const handleLogout = async () => {
    try {
      await core.signOut()
      setResult('')
      setWallet(null)
      setLoggedIn(false)
      setBlockchains([])
      setCoins([])
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message)
      }
    }
  }

  return (
    <div className="container">
      <button
        onClick={handleLogout}
        disabled={!wallet}
        className="function-button"
      >
        Logout
      </button>
    </div>
  )
}

export default LogoutButton
