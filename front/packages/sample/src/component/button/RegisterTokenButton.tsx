import React, { useState } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { loginState } from '../../atom/LoginAtom'
import { Core, Numbers, TransactionStatus } from '@alwallet/core'
import { blockchainState } from '../../atom/BlockchainAtom'
import { errorState } from '../../atom/ErrorAtom'
import { balanceState } from '../../atom/BalanceAtom'
import { resultState } from '../../atom/ResultAtom'
import { Time } from '@alwallet/core/dist/utils/time'
import { txStatusState } from '../../atom/TxStatusAtom'
import { walletState } from '../../atom/WalletAtom'
import { coinState } from '../../atom/CoinAtom'
import CoinDropdown from '../dropdown/CoinDropdown'
import { coinsState } from '../../atom/CoinsAtom'

const RegisterTokenButton: React.FC<{ core: Core }> = ({ core }) => {
  const [tokenAddress, setTokenAddress] = useState('')
  const isLoggedIn = useRecoilValue(loginState)
  const selectedBlockchain = useRecoilValue(blockchainState)
  const wallet = useRecoilValue(walletState)
  const setCoins = useSetRecoilState(coinsState)
  const setResult = useSetRecoilState(resultState)
  const setStatus = useSetRecoilState(txStatusState)
  const setError = useSetRecoilState(errorState)

  const handleRegisterToken = async () => {
    try {
      setResult('')
      setError('')
      setStatus(null)

      const chainId = selectedBlockchain!.chainId
      const coin = await core.registerToken(chainId, tokenAddress)
      console.log('coin:', coin)
      setCoins(await core.getCoins(chainId))
      setResult(`Token '${coin.name}' registered successfully`)
      // TODO: update with token balance
      const fetchedBalance = await core.getBalance(selectedBlockchain!.chainId)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="container">
      <div className="input-group">
        <label>
          Token Address:{' '}
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="Token Address"
          />
        </label>
      </div>
      <button
        onClick={handleRegisterToken}
        disabled={!wallet}
        className="function-button"
      >
        Register Token
      </button>
    </div>
  )
}

export default RegisterTokenButton
