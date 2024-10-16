import { atom } from 'recoil'
import { TransactionStatus } from '@alwallet/sdk'

export const txStatusState = atom<TransactionStatus | null>({
  key: 'txStatus',
  default: null
})
