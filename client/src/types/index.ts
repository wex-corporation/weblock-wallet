export interface SDKOptions {
  environment: 'local' | 'testnet' | 'mainnet'
  apiKey: string
}

export interface WalletAPI {
  create(): Promise<void>
  connect(): Promise<void>
  disconnect(): Promise<void>
  getAddress(): Promise<string>
  signMessage(message: string): Promise<string>
  signTransaction(transaction: TransactionRequest): Promise<string>
}

export interface TransactionRequest {
  to: string
  value: string
  data?: string
}
