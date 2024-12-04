import { CoreAdapter } from './adapters/core'
import { WalletSDKConfig, AvailableProviders } from './types'
import { SDKAlreadyInitializedError, SDKNotInitializedError } from './errors'
import { Logger } from './utils/logger'
import { Validation } from './utils/validation'
import { AuthResult } from './types/auth'

/**
 * WeBlock Wallet SDK의 메인 클래스
 * @public
 */
export class WalletSDK {
  private initialized = false
  private adapter: CoreAdapter | null = null

  /**
   * SDK 초기화
   * @param config - SDK 설정
   * @throws {SDKAlreadyInitializedError} 이미 초기화된 경우
   * @throws {ValidationError} 설정값이 유효하지 않은 경우
   */
  initialize(config: WalletSDKConfig): void {
    if (this.initialized) {
      throw new SDKAlreadyInitializedError()
    }

    try {
      Logger.debug('Validating SDK configuration', config)
      Validation.validateConfig(config)

      this.adapter = new CoreAdapter(config)
      this.initialized = true
      Logger.info('SDK initialized successfully')
    } catch (error) {
      Logger.error('SDK initialization failed', error)
      throw error
    }
  }

  /**
   * SDK가 초기화되었는지 확인
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * 로그인 상태 확인
   * @throws {SDKNotInitializedError} SDK가 초기화되지 않은 경우
   */
  async isLoggedIn(): Promise<boolean> {
    this.ensureInitialized()
    if (!this.adapter) {
      throw new SDKNotInitializedError()
    }
    return await this.adapter.isLoggedIn()
  }

  /**
   * OAuth 프로바이더로 ��그인
   * @param providerId - 인증 프로바이더 ID
   * @throws {SDKNotInitializedError} SDK가 초기화되지 않은 경우
   */
  async signInWithProvider(
    providerId: AvailableProviders
  ): Promise<AuthResult> {
    this.ensureInitialized()
    if (!this.adapter) {
      throw new SDKNotInitializedError()
    }
    return await this.adapter.signInWithProvider(providerId)
  }

  /**
   * 로그아웃
   * @throws {SDKNotInitializedError} SDK가 초기화되지 않은 경우
   */
  async signOut(): Promise<void> {
    this.ensureInitialized()
    if (!this.adapter) {
      throw new SDKNotInitializedError()
    }
    await this.adapter.signOut()
  }

  /**
   * SDK 초기화 상태 확인
   * @private
   * @throws {SDKNotInitializedError} SDK가 초기화되지 않은 경우
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new SDKNotInitializedError()
    }
  }
}
