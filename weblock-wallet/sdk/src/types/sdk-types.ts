export interface WalletSDKConfig {
  apiKey: string
  env: 'local' | 'staging' | 'production'
  orgHost?: string
}
