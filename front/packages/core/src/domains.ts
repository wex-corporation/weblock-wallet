export interface Blockchain {
  id: string
  name: string
  rpcUrl: string
  chainId: number
  currencySymbol: string
  currencyName: string
  currencyDecimals: number
  explorerUrl: string
  isTestnet: boolean
}

export interface Coin {
  id: string
  blockchainId: string
  name: string
  symbol: string
  contractAddress: string
  decimals: number
}

export interface User {
  id: string
  orgId: string
  email: string
  firebaseId: string
  provider: string
  blockchains: Blockchain[]
}

export interface Wallet {
  id: string
  userId: string
  address: string
  publicKey: string
  share1: string
  encryptedShare3: string
}
