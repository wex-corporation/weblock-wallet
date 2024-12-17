import { SDKOptions, SignInResponse, WalletResponse } from '../types'
import { InternalCore } from '../types/core'

export class UserModule {
  constructor(
    private readonly options: SDKOptions,
    private readonly core: InternalCore
  ) {}

  async signIn(_provider: string): Promise<SignInResponse> {
    // 임시 구현
    return {} as SignInResponse
  }

  async createWallet(_password: string): Promise<WalletResponse> {
    // 임시 구현
    return {} as WalletResponse
  }

  async recoverWallet(_password: string): Promise<WalletResponse> {
    // 임시 구현
    return {} as WalletResponse
  }

  async signOut(): Promise<void> {
    // 임시 구현
  }
}
