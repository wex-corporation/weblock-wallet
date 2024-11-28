export type BigNumberish = string | number | bigint

export interface Transaction {
  id: string
  from: string
  to: string
  value: BigNumberish
  data?: string
  gas?: BigNumberish
  gasPrice?: BigNumberish
  nonce?: number
  chainId: number
}

export interface TransactionReceipt {
  transactionHash: string
  blockHash: string
  blockNumber: number
  status: boolean
}

export enum TransactionStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  PENDING = 'PENDING'
}

export interface SendTransaction {
  amount: string
  to: string
  coin: string
  nonce?: number
  gasLimit?: bigint
  gasPrice?: string
}
