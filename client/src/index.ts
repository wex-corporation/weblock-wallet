// src/index.ts
import { SDKOptions, WalletAPI, UserAPI } from './types'
import { WalletModule } from './module/wallet'
import { UserModule } from './module/user'

export class WeBlockWallet {
  private readonly options: SDKOptions
  public readonly wallet: WalletAPI
  public readonly user: UserAPI

  constructor(options: SDKOptions) {
    this.options = options
    this.wallet = new WalletModule(options)
    this.user = new UserModule(options)
  }
}

export * from './types'
