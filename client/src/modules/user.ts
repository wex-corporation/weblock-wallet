import { SDKOptions, SignInResponse, WalletResponse } from '../types'
import { InternalCore } from '../core/types'

export class UserModule {
  constructor(
    private readonly options: SDKOptions,
    private readonly core: InternalCore
  ) {}

  async signIn(provider: string): Promise<SignInResponse> {
    const result = await this.core.auth.signIn(provider)

    if (result.status === 'WALLET_READY') {
      const walletInfo = await this.core.wallet.getInfo()
      return {
        status: 'WALLET_READY',
        email: result.email,
        photoURL: result.photoURL,
        wallet: walletInfo,
      }
    }

    return {
      status: result.status,
      email: result.email,
      photoURL: result.photoURL,
    }
  }

  async createWallet(password: string): Promise<WalletResponse> {
    return this.core.wallet.create(password)
  }

  async recoverWallet(password: string): Promise<WalletResponse> {
    return this.core.wallet.recover(password)
  }

  async signOut(): Promise<void> {
    return this.core.auth.signOut()
  }
}
