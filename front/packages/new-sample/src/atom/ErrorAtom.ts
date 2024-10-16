import { atom } from 'recoil'
import { Blockchain } from '@alwallet/sdk'

export const errorState = atom<string>({
  key: 'error',
  default: ''
})
