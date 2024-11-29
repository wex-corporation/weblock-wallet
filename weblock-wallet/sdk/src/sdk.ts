import { Logger } from './utils/logger'
import { CoreAdapter } from './core-adapter'
import { WalletSDKConfig, AvailableProviders } from './types'

export class WalletSDK {
  private initialized = false
  private coreAdapter: CoreAdapter | null = null

  /**
   * SDK 초기화 메서드
   * @param config - API 키, 환경, 조직 호스트 등 초기화 설정
   * @throws Error - SDK가 이미 초기화된 경우
   */
  initialize(config: WalletSDKConfig): void {
    if (this.initialized) {
      throw new Error('SDK가 이미 초기화되었습니다.')
    }

    Logger.info('WalletSDK: 초기화 시작', config)
    this.coreAdapter = new CoreAdapter(config)
    this.initialized = true
    Logger.info('WalletSDK: 초기화 완료')
  }

  /**
   * SDK 초기화 여부 확인
   * @returns boolean - 초기화 여부
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * OAuth 프로바이더를 사용한 로그인
   * @param providerId - 사용할 OAuth 프로바이더 ID
   * @throws Error - 초기화되지 않은 경우 또는 로그인 실패 시
   */
  async signInWithProvider(providerId: AvailableProviders): Promise<void> {
    this.ensureInitialized()
    Logger.debug('WalletSDK: signInWithProvider 호출', { providerId })

    try {
      await this.coreAdapter!.signInWithProvider(providerId)
      Logger.info('WalletSDK: 로그인 성공')
    } catch (error) {
      Logger.error('WalletSDK: 로그인 실패', error)
      throw error
    }
  }

  /**
   * 현재 사용자를 로그아웃
   * @throws Error - 초기화되지 않은 경우 또는 로그아웃 실패 시
   */
  async signOut(): Promise<void> {
    this.ensureInitialized()
    Logger.debug('WalletSDK: signOut 호출')

    try {
      await this.coreAdapter!.signOut()
      Logger.info('WalletSDK: 로그아웃 성공')
    } catch (error) {
      Logger.error('WalletSDK: 로그아웃 실패', error)
      throw error
    }
  }

  /**
   * 사용자가 로그인 상태인지 확인
   * @returns boolean - 로그인 상태 여부
   * @throws Error - 초기화되지 않은 경우 또는 상태 확인 실패 시
   */
  async isLoggedIn(): Promise<boolean> {
    this.ensureInitialized()
    Logger.debug('WalletSDK: isLoggedIn 호출')

    try {
      const isLoggedIn = await this.coreAdapter!.isLoggedIn()
      Logger.info('WalletSDK: 로그인 상태 확인', { isLoggedIn })
      return isLoggedIn
    } catch (error) {
      Logger.error('WalletSDK: 로그인 상태 확인 실패', error)
      throw error
    }
  }

  /**
   * SDK 초기화 여부 확인 및 보장
   * @throws Error - 초기화되지 않은 경우
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      const errorMessage =
        'SDK가 초기화되지 않았습니다. initialize()를 호출하세요.'
      Logger.error(errorMessage)
      throw new Error(errorMessage)
    }
  }
}
