import {
  SDKError,
  SDKErrorCode,
  SDKOptions,
  SignInResponse,
  WalletResponse,
  SignInStatus,
} from '../types'
import { InternalCore } from '../core/types'
import { WalletModule } from './wallet'

export class UserModule {
  constructor(
    private readonly options: SDKOptions,
    private readonly core: InternalCore,
    private readonly walletModule: WalletModule
  ) {}

  async signIn(provider: string): Promise<SignInResponse> {
    const result = await this.core.auth.signIn(provider)

    if (result.status === 'WALLET_READY') {
      const walletInfo = await this.walletModule.getInfo()
      return {
        status: SignInStatus.WALLET_READY,
        email: result.email,
        photoURL: result.photoURL,
        wallet: walletInfo,
      }
    }

    return {
      status: result.status as SignInStatus,
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
    const walletInfo = await this.walletModule.getInfo()
    return { wallet: walletInfo }
  }

  async retrieveWallet(password: string): Promise<WalletResponse> {
    const address = await this.core.wallet.retrieveWallet(password)
    if (!address) {
      throw new SDKError(
        '지갑 주소를 찾을 수 없습니다',
        SDKErrorCode.WALLET_NOT_FOUND
      )
    }
    const wallet = await this.walletModule.getInfo()
    return { wallet }
  }

  async signOut(): Promise<void> {
    return this.core.auth.signOut()
  }
}
