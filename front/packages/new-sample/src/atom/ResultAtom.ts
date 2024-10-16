import { atom } from 'recoil'
import { Blockchain } from '@alwallet/sdk'

export const resultState = atom<string>({
  key: 'result',
  default: ''
})
