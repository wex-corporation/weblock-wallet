import { atom } from 'recoil'
import { Blockchain } from '@alwallet/core'

export const errorState = atom<string>({
  key: 'error',
  default: ''
})
