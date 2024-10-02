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

const SendCoinButton: React.FC<{ core: Core }> = ({ core }) => {
  const [amount, setAmount] = useState('')
  const [to, setTo] = useState('')
  const isLoggedIn = useRecoilValue(loginState)
  const selectedBlockchain = useRecoilValue(blockchainState)
  const selectedCoin = useRecoilValue(coinState)
  const wallet = useRecoilValue(walletState)
  const setBalance = useSetRecoilState(balanceState)
  const setResult = useSetRecoilState(resultState)
  const setStatus = useSetRecoilState(txStatusState)
  const setError = useSetRecoilState(errorState)

  const handleSendCoin = async () => {
    try {
      setResult('')
      setError('')
      setStatus(null)

      const chainId = selectedBlockchain!.chainId
      const txHash = await core.sendTransaction(selectedBlockchain!.chainId, {
        amount: amount,
        to: to,
        coin: selectedCoin!
      })
      setResult(`TxHash: ${txHash}`)
      setStatus(TransactionStatus.PENDING)
      const fetchedBalance = await core.getBalance(selectedBlockchain!.chainId)
      await handleCheckTransaction(chainId, txHash, 5000, 180000)
    } catch (e) {
      setError(e.message)
    }
  }

  const handleCheckTransaction = async (
    chainId: number,
    txHash: string,
    timeout: number,
    maxDuration: number
  ) => {
    let status = TransactionStatus.PENDING

    const start = Date.now()
    while (
      TransactionStatus.PENDING === status &&
      Date.now() - start < maxDuration
    ) {
      try {
        await Time.delay(timeout)
        status = await core.getTransactionStatus(chainId, txHash)
        setStatus(status)
      } catch (error) {
        console.error('Error checking transaction status:', error)
        break
      }
    }

    if (status === TransactionStatus.PENDING) {
      setResult(
        `TxHash: ${txHash}\nTransaction waited for ${
          maxDuration / 1000 / 60
        } minutes, but status still pending`
      )
    }
    setBalance(
      Numbers.weiToEth(Numbers.hexToDecimal(await core.getBalance(chainId)))
    )
  }

  return (
    <div className="container">
      {isLoggedIn && <CoinDropdown core={core} />} {/* 조건부 렌더링 */}
      <div className="input-group">
        <label>
          To Address:{' '}
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="To Address"
          />
        </label>
      </div>
      <div className="input-group">
        <label>
          Amount:{' '}
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
          />
        </label>
      </div>
      <button
        onClick={handleSendCoin}
        disabled={!wallet}
        className="function-button"
      >
        Send Transaction
      </button>
    </div>
  )
}

export default SendCoinButton
