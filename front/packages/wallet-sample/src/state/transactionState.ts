// src/state/transactionState.ts
import { atom } from 'recoil'

interface TransactionStatus {
  status: '성공' | '실패' | '대기'
  txHash: string
  chainId: number
}

export const transactionStatusState = atom<TransactionStatus | null>({
  key: 'transactionStatusState',
  default: null
})
