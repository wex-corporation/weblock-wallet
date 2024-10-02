import { atom } from 'recoil'
import { TransactionStatus } from '@alwallet/core'

export const txStatusState = atom<TransactionStatus | null>({
  key: 'txStatus',
  default: null
})
