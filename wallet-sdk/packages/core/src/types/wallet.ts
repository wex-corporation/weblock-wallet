export interface Wallet {
  id: string;
  userId: string;
  address: string;
  chainId: number;
  createdAt: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  chainId: number;
  status: TransactionStatus;
}

export enum TransactionStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Failed = 'failed',
}
