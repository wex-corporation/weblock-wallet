import React, { useEffect } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { coinsState } from '../../atom/CoinsAtom'
import { coinState } from '../../atom/CoinAtom'
import { AlWalletSDK } from '@alwallet/sdk'

const CoinDropdown: React.FC<{ sdk: AlWalletSDK }> = ({ sdk }) => {
  const coins = useRecoilValue(coinsState)
  const [selectedCoin, setSelectedCoin] = useRecoilState(coinState)

  useEffect(() => {
    if (coins.length > 0 && !selectedCoin) {
      setSelectedCoin(coins[0])
    }
  }, [coins, selectedCoin, setSelectedCoin])

  const handleSelectCoin = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selected = coins.find(
      (blockchain) => blockchain.name === event.target.value
    )
    if (selected) {
      setSelectedCoin(selected)
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-xl font-bold text-center">Select Coin</h3>
      {coins.length == 0 ? (
        <select
          className="min-w-[300px] w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={''}
        ></select>
      ) : (
        <select
          className="min-w-[300px] w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
