import { atom } from 'recoil'
import { Coin } from '@alwallet/core'

export const coinsState = atom<Coin[]>({
  key: 'coins',
  default: []
})
