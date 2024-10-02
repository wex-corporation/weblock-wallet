import { atom } from 'recoil'
import { Blockchain } from '@alwallet/core'

export const blockchainsState = atom<Blockchain[]>({
  key: 'blockchains',
  default: []
})
