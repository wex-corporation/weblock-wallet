import React from 'react'
import { walletState } from '../atom/WalletAtom'
import { Core, Numbers } from '@alwallet/core'

import { useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { blockchainState } from '../atom/BlockchainAtom'
import { balanceState } from '../atom/BalanceAtom'
import './../style/Style.css'

interface WalletSectionProps {
  core: Core
}

const WalletSection: React.FC<WalletSectionProps> = ({ core }) => {
  const wallet = useRecoilValue(walletState)
  const selectedBlockchain = useRecoilValue(blockchainState)
  const [balance, setBalance] = useRecoilState(balanceState)

  useEffect(() => {
    async function fetchBalance() {
      try {
        const fetchedBalance = await core.getBalance(
          selectedBlockchain!.chainId
        )
        setBalance(Numbers.weiToEth(Numbers.hexToDecimal(fetchedBalance)))
      } catch (error) {
        console.error('Error fetching balance:', error)
      }
    }

    if (wallet && selectedBlockchain) {
      fetchBalance()
    }
  }, [wallet, core, selectedBlockchain, balance])

  if (!wallet) {
    return (
      <div className="section">
        <h2>Wallet Information</h2>
        <div className="text-group">
          <label>
            Address: <input type="text" value="No wallet data" readOnly />
          </label>
        </div>
      </div>
    )
  } else {
    if (balance) {
      return (
        <div className="section">
          <h2>Wallet Information</h2>
          <div className="text-group">
            <label>
              Address:{' '}
              <input
                type="text"
                value={wallet.address}
                placeholder="Wallet address"
                readOnly
              />
            </label>
          </div>
          <div className="text-group">
            <label>
              Balance:{' '}
              <input
                type="text"
                value={balance}
                placeholder="Balance"
                readOnly
              />
            </label>
          </div>
        </div>
      )
    }
    return (
      <div className="section">
        <h2>Wallet Information</h2>
        <div className="text-group">
          <label>
            Address:{' '}
            <input
              type="text"
              value={wallet.address}
              placeholder="No wallet data"
              readOnly
            />
          </label>
        </div>
      </div>
    )
  }
}

export default WalletSection
