import { defaultConfig } from '@wefunding-dev/wallet-core'

export interface WalletSDKConfig {
  apiKey: string
  env: keyof (typeof defaultConfig)['baseUrls']
  orgHost?: string
}
