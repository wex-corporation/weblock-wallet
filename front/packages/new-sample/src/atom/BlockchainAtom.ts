import { atom } from 'recoil'
import { Blockchain } from '@alwallet/sdk'

export const blockchainState = atom<Blockchain | null>({
  key: 'blockchain',
  default: null
})
