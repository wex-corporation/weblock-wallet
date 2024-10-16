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

  // if (coins.length == 0) {
  //   return (
  //     <div className="container">
  //       <h3>Select Coin</h3>
  //       <select
  //         className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  //         onChange={handleSelectCoin}
  //         value={''}
  //       ></select>
  //     </div>
  //   )
  // }
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-xl font-bold text-center">Select Coin</h3>
      {coins.length == 0 ? (
        <select
          className="min-w-[300px] w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={handleSelectCoin}
          value={''}
        >
          <option key={'coin.name'} value={'coin.name'} className="px-4 py-2">
            {'coin.name'}
          </option>
          <option key={'coin.name'} value={'coin.name'} className="px-4 py-2">
            {'coin.name'}
          </option>
          <option key={'coin.name'} value={'coin.name'} className="px-4 py-2">
            {'coin.name'}
          </option>
          <option key={'coin.name'} value={'coin.name'} className="px-4 py-2">
            {'coin.name'}
          </option>
          <option key={'coin.name'} value={'coin.name'} className="px-4 py-2">
            {'coin.name'}
          </option>
        </select>
      ) : (
        <select
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={handleSelectCoin}
          value={selectedCoin?.name}
        >
          {coins.map((coin) => (
            <option key={coin.name} value={coin.name}>
              {coin.name}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}

export default CoinDropdown
