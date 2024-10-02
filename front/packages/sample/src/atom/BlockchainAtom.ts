import { atom } from 'recoil'
import { Blockchain } from '@alwallet/core'

export const blockchainState = atom<Blockchain | null>({
  key: 'blockchain',
  default: null
})
