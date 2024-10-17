import React, { useState } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { blockchainState } from '../../atom/BlockchainAtom'
import { errorState } from '../../atom/ErrorAtom'
import { resultState } from '../../atom/ResultAtom'
import { txStatusState } from '../../atom/TxStatusAtom'
import { walletState } from '../../atom/WalletAtom'
import { coinsState } from '../../atom/CoinsAtom'
import { AlWalletSDK } from '@alwallet/sdk'

const RegisterTokenButton: React.FC<{ sdk: AlWalletSDK }> = ({ sdk }) => {
  const [tokenAddress, setTokenAddress] = useState('')
  // const isLoggedIn = useRecoilValue(loginState)
  const selectedBlockchain = useRecoilValue(blockchainState)
  const wallet = useRecoilValue(walletState)
  const setCoins = useSetRecoilState(coinsState)
  const setResult = useSetRecoilState(resultState)
  const setStatus = useSetRecoilState(txStatusState)
  const setError = useSetRecoilState(errorState)

  const handleRegisterToken = async () => {
    if (!tokenAddress) return

    try {
      setResult('')
      setError('')
      setStatus(null)

      const chainId = selectedBlockchain!.chainId
      const coin = await sdk.tokens.registerToken(chainId, tokenAddress)
      setCoins(await sdk.tokens.getCoins(chainId))
      setResult(`Token '${coin.name}' registered successfully`)
      // TODO: update with token balance
      // const fetchedBalance = await sdk.wallets.getBalance(
      //   selectedBlockchain!.chainId
      // )
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="flex flex-col gap-2.5 w-full items-center">
      <h3 className="text-xl font-bold text-center">Register Token</h3>
      <div className="flex flex-col gap-2 w-full items-center">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400">Token Address</label>
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="Token Address"
            className="min-w-[300px] w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleRegisterToken}
          disabled={!wallet}
          className="min-w-[300px] px-4 py-2 bg-gray-700 text-white rounded-md mb-2"
        >
          Register Token
        </button>
      </div>
    </div>
  )
}

export default RegisterTokenButton
