import { SDKOptions, WalletAPI } from './types'
import { WalletModule } from './module/wallet'

export class WeBlockWallet {
  private readonly options: SDKOptions
  public readonly wallet: WalletAPI

  constructor(options: SDKOptions) {
    this.options = options
    this.wallet = new WalletModule(options)
  }
}

export * from './types'
