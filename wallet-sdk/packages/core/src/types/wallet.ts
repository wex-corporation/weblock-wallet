export interface WalletDTO {
  id: string;
  orgId: string;
  userId: string;
  address: string;
  chainId: number;
  createdAt: string;
  updatedAt: string;
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

export interface CreateWalletRequest {
  blockchainId: string;
  password: string;
}

export interface GetWalletRequest {
  blockchainId: string;
}

export interface WalletBalanceDTO {
  address: string;
  balance: string;
  symbol: string;
  decimals: number;
}
