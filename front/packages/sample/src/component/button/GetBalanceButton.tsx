import React from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { loginState } from '../../atom/LoginAtom'
import { Core, Numbers } from '@alwallet/core'
import { blockchainState } from '../../atom/BlockchainAtom'
import { errorState } from '../../atom/ErrorAtom'
import { balanceState } from '../../atom/BalanceAtom'
import { resultState } from '../../atom/ResultAtom'
import { txStatusState } from '../../atom/TxStatusAtom'
import { walletState } from '../../atom/WalletAtom'

const GetBalanceButton: React.FC<{ core: Core }> = ({ core }) => {
  const selectedBlockchain = useRecoilValue(blockchainState)
  const wallet = useRecoilValue(walletState)
  const setBalance = useSetRecoilState(balanceState)
  const setResult = useSetRecoilState(resultState)
  const setStatus = useSetRecoilState(txStatusState)
  const setError = useSetRecoilState(errorState)

  const handleGetBalance = async () => {
    try {
      setResult('')
      setError('')
      setStatus(null)
      const fetchedBalance = await core.getBalance(selectedBlockchain!.chainId)
      setBalance(Numbers.weiToEth(Numbers.hexToDecimal(fetchedBalance)))
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message)
      }
    }
  }

  return (
    <div className="container">
      <button
        onClick={handleGetBalance}
        disabled={!wallet}
        className="function-button"
      >
        Get Balance
      </button>
    </div>
  )
}

export default GetBalanceButton
