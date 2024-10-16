import { atom } from 'recoil'
import { Blockchain, Coin } from '@alwallet/sdk'

export const coinState = atom<Coin | null>({
  key: 'coin',
  default: null
})
