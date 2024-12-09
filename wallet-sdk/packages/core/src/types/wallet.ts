export interface WalletDTO {
  id: string;
  address: string;
  publicKey: string;
  share1: string;
  encryptedShare3: string;
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
  address: string;
  publicKey: string;
  share1: string;
  encryptedShare3: string;
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
