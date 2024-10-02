import React, { useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { Core } from '@alwallet/core'
import { coinsState } from '../../atom/CoinsAtom'
import { coinState } from '../../atom/CoinAtom'

const CoinDropdown: React.FC<{ core: Core }> = ({ core }) => {
  const coins = useRecoilValue(coinsState)
  const [selectedCoin, setSelectedCoin] = useRecoilState(coinState)

  useEffect(() => {
    if (coins.length > 0 && !selectedCoin) {
      setSelectedCoin(coins[0])
    }
  }, [coins, selectedCoin, setSelectedCoin])

  const handleSelectCoin = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = coins.find(
      (blockchain) => blockchain.name === event.target.value
    )
    if (selected) {
      setSelectedCoin(selected)
    }
  }

  if (coins.length == 0) {
    return (
      <div className="container">
        <h3>Select Coin</h3>
        <select onChange={handleSelectCoin} value={''}></select>
      </div>
    )
  }
  return (
    <div className="dropdown-group">
      <h3>Select Coin</h3>
      <select onChange={handleSelectCoin} value={selectedCoin?.name}>
        {coins.map((coin) => (
          <option key={coin.name} value={coin.name}>
            {coin.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default CoinDropdown
