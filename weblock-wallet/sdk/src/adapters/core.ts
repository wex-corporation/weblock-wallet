import { Core } from '@wefunding-dev/wallet-core'
import { AvailableProviders as CoreProviders } from '@wefunding-dev/wallet-types'
import { AvailableProviders, AuthResult } from '../types/auth'
import { WalletSDKConfig } from '../types'
import { Logger } from '../utils/logger'

/**
 * Core 모듈과의 통신을 담당하는 어댑터
 * @internal
 */
export class CoreAdapter {
  private core: Core

  constructor(config: WalletSDKConfig) {
    const { apiKey, env, orgHost } = config
    Logger.info('CoreAdapter: Initializing...', { env, orgHost })
    this.core = new Core(env, apiKey, orgHost ?? 'http://localhost:3000')
  }

  /**
   * 프로바이더를 통한 로그인
   */
  async signInWithProvider(provider: AvailableProviders): Promise<AuthResult> {
    const result = await this.core.signInWithProvider(
      provider as unknown as CoreProviders
    )
    return {
      isNewUser: result.isNewUser,
      email: result.email,
      photoURL: result.photoURL
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.core.signOut()
    } catch (error) {
      Logger.error('CoreAdapter: Sign out failed', error)
      throw error
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      return await this.core.isLoggedIn()
    } catch (error) {
      Logger.error('CoreAdapter: Check login status failed', error)
      throw error
    }
  }
}
