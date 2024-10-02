import { atom } from 'recoil'

export const balanceState = atom<string>({
  key: 'balance',
  default: '0.0'
})
