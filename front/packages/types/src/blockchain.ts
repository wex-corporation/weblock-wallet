// blockchain.ts

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

export interface RegisterBlockchainRequest {
  name: string
  rpcUrl: string
  chainId: number
  currencySymbol: string
  currencyName: string
  currencyDecimals: number
  explorerUrl: string
  isTestnet: boolean
}

export interface RegisterTokenRequest {
  blockchainId: string
  contractAddress: string
  name: string
  symbol: string
  decimals: number
}

export interface RpcError {
  code: number
  message: string
}

export interface RpcResponse<T> {
  jsonrpc: string
  id: number
  result: T | any
  error: {
    code: number
    message: string
  }
}
