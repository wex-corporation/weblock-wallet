import { atom } from 'recoil'
import { Coin } from '@alwallet/sdk'

export const coinsState = atom<Coin[]>({
  key: 'coins',
  default: []
})
