// wallet.ts

export interface Wallet {
  id: string
  userId: string
  address: string
  publicKey: string
  share1: string
  encryptedShare3: string
}

export interface ERC20Info {
  name: string
  symbol: string
  decimals: number
}

export interface WalletKeyPair {
  publicKey: Uint8Array
  privateKey: Uint8Array
}

export type CoinType = 'ETH' | 'MATIC' | 'USDT'

export interface WalletBalance {
  coin: CoinType
  balance: string
}

export interface TransferRequest {
  to: string
  amount: string
  coin: CoinType
}

export interface CreateWalletRequest {
  address: string
  publicKey: string
  share1: string
  encryptedShare3: string
}

export interface UpdateWalletKeyRequest {
  share1: string
  encryptedShare3: string
}
