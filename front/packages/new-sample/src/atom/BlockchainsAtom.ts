import { atom } from 'recoil'
import { Blockchain } from '@alwallet/sdk'

export const blockchainsState = atom<Blockchain[]>({
  key: 'blockchains',
  default: []
})
