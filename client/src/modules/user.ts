import {
  SDKError,
  SDKErrorCode,
  SDKOptions,
  SignInResponse,
  WalletResponse,
} from '../types'
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
    if (!password) {
      throw new SDKError('Password is required', SDKErrorCode.INVALID_PARAMS)
    }

    await this.core.wallet.create(password)
    await this.core.auth.clearNewUserFlag()
    const walletInfo = await this.core.wallet.getInfo()
    return { wallet: walletInfo }
  }

  async retrieveWallet(password: string): Promise<WalletResponse> {
    const address = await this.core.wallet.retrieveWallet(password)
    const wallet = await this.core.wallet.getInfo()
    return { wallet }
  }

  async signOut(): Promise<void> {
    return this.core.auth.signOut()
  }
}
