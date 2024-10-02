import React, { useState } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { walletState } from '../../atom/WalletAtom'
import { loginState } from '../../atom/LoginAtom'
import { Core } from '@alwallet/core'
import { blockchainsState } from '../../atom/BlockchainsAtom'
import { errorState } from '../../atom/ErrorAtom'
import BlockchainDropdown from '../dropdown/BlockchainDropdown'
import { coinsState } from '../../atom/CoinsAtom'

const LoginButton: React.FC<{ core: Core }> = ({ core }) => {
  const [isLoggedIn, setLoggedIn] = useRecoilState(loginState)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [wallet, setWallet] = useRecoilState(walletState)
  const [userPassword, setUserPassword] = useState('')
  const setError = useSetRecoilState(errorState)
  const setBlockchains = useSetRecoilState(blockchainsState)

  const handleLogin = async () => {
    try {
      // login
      await core.signInWithGoogle()
      setLoggedIn(true)

      // retrieve wallet without password
      await core.retrieveWallet()
      setBlockchains(await core.getBlockchains())
      setUserPassword('')
      setError('')
      setWallet(core.getWallet()!)
      setIsPasswordModalOpen(false)
    } catch (e) {
      if (e instanceof Error) {
        if (
          e.message === 'User password needs to be provided' ||
          e.message === 'Must provide userPassword for new user'
        ) {
          // if password needed, open password modal
          setIsPasswordModalOpen(true)
          return
        }
        setError(e.message)
      }
    }
  }

  const handleGetWallet = async () => {
    if (!userPassword) {
      setError('User password needs to be provided')
    }
    try {
      if (isLoggedIn && userPassword) {
        await core.retrieveWallet(userPassword)
        setBlockchains(await core.getBlockchains())
        setUserPassword('')
        setError('')
        setWallet(core.getWallet()!)
        setIsPasswordModalOpen(false)
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message)
      }
    }
  }

  return (
    <div className="container">
      {isLoggedIn ? (
        <>
          {isPasswordModalOpen && (
            <div className="input-group">
              <label>
                WalletPassword:{' '}
                <input
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="UserPassword"
                />
              </label>
              <button onClick={handleGetWallet} className="function-button">
                Confirm
              </button>
            </div>
          )}
          <BlockchainDropdown core={core} />
          <button disabled={true} className="function-button">
            Logged in
          </button>
        </>
      ) : (
        <button onClick={handleLogin} className="function-button">
          Login with Google
        </button>
      )}
    </div>
  )
}

export default LoginButton
