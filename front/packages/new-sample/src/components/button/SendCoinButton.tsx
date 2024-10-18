import React, { useState } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { blockchainState } from '../../atom/BlockchainAtom'
import { errorState } from '../../atom/ErrorAtom'
import { balanceState } from '../../atom/BalanceAtom'
import { resultState } from '../../atom/ResultAtom'
import { txStatusState } from '../../atom/TxStatusAtom'
import { walletState } from '../../atom/WalletAtom'
import { coinState } from '../../atom/CoinAtom'
import { AlWalletSDK, Numbers, TransactionStatus, Time } from '@alwallet/sdk'

const SendCoinButton: React.FC<{ sdk: AlWalletSDK }> = ({ sdk }) => {
  const [amount, setAmount] = useState('')
  const [to, setTo] = useState('')
  const selectedBlockchain = useRecoilValue(blockchainState)
  const selectedCoin = useRecoilValue(coinState)
  const wallet = useRecoilValue(walletState)
  const setBalance = useSetRecoilState(balanceState)
  const setResult = useSetRecoilState(resultState)
  const setStatus = useSetRecoilState(txStatusState)
  const setError = useSetRecoilState(errorState)

  const handleSendCoin = async () => {
    if (!to || !amount) return

    try {
      setResult('')
      setError('')
      setStatus(null)

      const chainId = selectedBlockchain!.chainId
      const txHash = await sdk.wallets.sendTransaction(
        (await sdk.blockchains.getRegisteredBlockchains()).filter(
          (blockchain: any) => blockchain.chainId === chainId
        )[0].rpcUrl,
        chainId,
        amount,
        to,
        selectedCoin!
      )
      setResult(`TxHash: ${txHash}`)
      setStatus(TransactionStatus.PENDING)
      const fetchedBalance = await sdk.wallets.getBalance(
        selectedBlockchain!.chainId
      )
      console.log('fetchedBalance', fetchedBalance)
      await handleCheckTransaction(chainId, txHash, 5000, 180000)
    } catch (e: any) {
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
        // TODO: update with getTransactionStatus
        // status = await sdk.wallets.getTransactionStatus(chainId, txHash)
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
      Numbers.weiToEth(
        Numbers.hexToDecimal(await sdk.wallets.getBalance(chainId))
      )
    )
  }

  return (
    <div className="flex flex-col gap-2 w-full items-center">
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400">To Address</label>
        <input
          type="text"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="To Address"
          className="min-w-[300px] w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="min-w-[300px] w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        onClick={handleSendCoin}
        disabled={!wallet}
        className="min-w-[300px] px-4 py-2 bg-blue-500 text-white rounded-md mb-2"
      >
        Send Transaction
      </button>
    </div>
  )
}

export default SendCoinButton
