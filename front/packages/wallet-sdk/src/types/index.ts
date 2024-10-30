export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId: string
}

export interface EnvironmentConfig {
  apiBaseUrl: string
  firebaseConfig: FirebaseConfig
}

export interface FirebaseCredentials {
  firebaseId: string
  email: string
  idToken: string
}

export interface SendTransaction {
  amount: string
  to: string
  coin: Coin
  nonce?: number
  gasLimit?: bigint
  gasPrice?: string
}

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
