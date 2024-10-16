import { atom } from 'recoil'
import { Wallet } from 'ethers'

export const walletState = atom<Wallet | null>({
  key: 'wallet',
  default: null
})
