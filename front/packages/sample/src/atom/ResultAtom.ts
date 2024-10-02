import { atom } from 'recoil'
import { Blockchain } from '@alwallet/core'

export const resultState = atom<string>({
  key: 'result',
  default: ''
})
