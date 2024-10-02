import { atom } from 'recoil'
import { Blockchain, Coin } from '@alwallet/core'

export const coinState = atom<Coin | null>({
  key: 'coin',
  default: null
})
