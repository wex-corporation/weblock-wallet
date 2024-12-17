export interface SignInRequest {
  firebaseId: string
  email: string
  idToken: string
  provider: string
}

export interface SignInResponse {
  token: string
  isNewUser: boolean
}

export interface BlockchainRequest {
  name: string
  rpcUrl: string
  chainId: number
  currencySymbol: string
  currencyName: string
  currencyDecimals: number
  explorerUrl: string
  isTestnet: boolean
}

export interface TokenRequest {
  blockchainId: string
  contractAddress: string
  name: string
  symbol: string
  decimals: number
}

export interface UserResponse {
  id: string
  orgId: string
  email: string
  firebaseId: string
  provider: string
  blockchains: BlockchainResponse[]
}

export interface BlockchainResponse {
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

export interface TokenResponse {
  id: string
  blockchainId: string
  name: string
  symbol: string
  contractAddress: string
  decimals: number
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

export interface WalletResponse {
  id: string
  userId: string
  address: string
  publicKey: string
  share1: string
  encryptedShare3: string
}

export interface CreateOrganizationRequest {
  name: string
  apiKey: string
}

export interface SendRpcRequest {
  chainId: number
  jsonrpc: string
  id: number | string
  method: string
  params: any[]
}

export interface JsonRpcResponse<T = any> {
  id: number | string
  jsonrpc: string
  result?: T
  error?: {
    code: number
    message: string
    data?: string
  }
}
