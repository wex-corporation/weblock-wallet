import React, { useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { Blockchain, Core } from '@alwallet/core'
import { blockchainState } from '../../atom/BlockchainAtom'
import { blockchainsState } from '../../atom/BlockchainsAtom'
import { coinsState } from '../../atom/CoinsAtom'

const BlockchainDropdown: React.FC<{ core: Core }> = ({ core }) => {
  const blockchains = useRecoilValue(blockchainsState)
  const [selectedBlockchain, setSelectedBlockchain] =
    useRecoilState(blockchainState)
  const setCoins = useSetRecoilState(coinsState)

  useEffect(() => {
    async function fetchData() {
      if (blockchains.length > 0 && !selectedBlockchain) {
        setSelectedBlockchain(blockchains[0])
        const coins = await core.getCoins(blockchains[0].chainId)
        setCoins(coins)
      }
    }

    fetchData()
  }, [blockchains, selectedBlockchain, setSelectedBlockchain])

  const handleSelectBlockchain = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selected = blockchains.find(
      (blockchain) => blockchain.name === event.target.value
    )
    if (selected) {
      setSelectedBlockchain(selected)
      setCoins(await core.getCoins(selected.chainId))
    }
  }

  if (blockchains.length == 0) {
    return (
      <div className="container">
        <select onChange={handleSelectBlockchain} value={''}></select>
      </div>
    )
  }
  return (
    <div className="dropdown-group">
      <h3>Select Blockchain</h3>
      <select
        onChange={handleSelectBlockchain}
        value={selectedBlockchain?.name}
      >
        {blockchains.map((blockchain) => (
          <option key={blockchain.name} value={blockchain.name}>
            {blockchain.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default BlockchainDropdown
