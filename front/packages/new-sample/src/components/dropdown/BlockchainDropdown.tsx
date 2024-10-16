import React, { useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
// import { Blockchain, Core } from '@alwallet/sdk'
import { blockchainState } from '../../atom/BlockchainAtom'
import { blockchainsState } from '../../atom/BlockchainsAtom'
import { coinsState } from '../../atom/CoinsAtom'

const BlockchainDropdown: React.FC<{ core: any }> = ({ core }) => {
  const blockchains = useRecoilValue(blockchainsState)
  const [selectedBlockchain, setSelectedBlockchain] =
    useRecoilState(blockchainState)
  const setCoins = useSetRecoilState(coinsState)

  // useEffect(() => {
  //   async function fetchData() {
  //     if (blockchains.length > 0 && !selectedBlockchain) {
  //       setSelectedBlockchain(blockchains[0])
  //       const coins = await core.getCoins(blockchains[0].chainId)
  //       setCoins(coins)
  //     }
  //   }
  //
  //   fetchData()
  // }, [blockchains, selectedBlockchain, setSelectedBlockchain])

  // const handleSelectBlockchain = async (
  //   event: React.ChangeEvent<HTMLSelectElement>
  // ) => {
  //   const selected = blockchains.find(
  //     (blockchain) => blockchain.name === event.target.value
  //   )
  //   if (selected) {
  //     setSelectedBlockchain(selected)
  //     setCoins(await core.getCoins(selected.chainId))
  //   }
  // }

  // if (blockchains.length == 0) {
  //   return (
  //     <div className="container">
  //       <h3 className="text-xl font-bold text-center">Select Blockchain</h3>
  //       <select onChange={handleSelectBlockchain} value={''}></select>
  //     </div>
  //   )
  // }
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-xl font-bold text-center">Select Blockchain</h3>
      {blockchains.length == 0 ? (
        <select
          className="min-w-[300px] w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          // onChange={handleSelectBlockchain}
          value={''}
        >
          <option
            key={'blockchain.name'}
            value={'blockchain.name'}
            className="px-4 py-2"
          >
            {'blockchain.name'}
          </option>
          <option
            key={'blockchain.name'}
            value={'blockchain.name'}
            className="px-4 py-2"
          >
            {'blockchain.name'}
          </option>
          <option
            key={'blockchain.name'}
            value={'blockchain.name'}
            className="px-4 py-2"
          >
            {'blockchain.name'}
          </option>
          <option
            key={'blockchain.name'}
            value={'blockchain.name'}
            className="px-4 py-2"
          >
            {'blockchain.name'}
          </option>
          <option
            key={'blockchain.name'}
            value={'blockchain.name'}
            className="px-4 py-2"
          >
            {'blockchain.name'}
          </option>
        </select>
      ) : (
        <select
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          // onChange={handleSelectBlockchain}
          value={selectedBlockchain?.name}
        >
          {blockchains.map((blockchain) => (
            <option key={blockchain.name} value={blockchain.name}>
              {blockchain.name}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}

export default BlockchainDropdown
