import { Logger } from '../utils/logger'
import { Core } from '@wefunding-dev/wallet-core'
import { WalletSDKConfig, AvailableProviders } from '../types'

export class CoreAdapter {
  private core: Core

  constructor(config: WalletSDKConfig) {
    const { apiKey, env, orgHost } = config

    Logger.info('CoreAdapter: 초기화 시작', config)
    this.core = new Core(env, apiKey, orgHost ?? 'http://localhost:3000')
    Logger.info('CoreAdapter: Core 인스턴스 생성 완료')
  }

  /**
   * OAuth 프로바이더를 사용한 로그인 처리
   * @param providerId - 사용하려는 OAuth 프로바이더
   * @throws Error - 로그인 중 발생한 에러
   */
  async signInWithProvider(providerId: AvailableProviders): Promise<void> {
    Logger.debug('CoreAdapter: signInWithProvider 호출', { providerId })
    try {
      await this.core.signInWithProvider(providerId)
      Logger.info('CoreAdapter: 로그인 성공')
    } catch (error) {
      Logger.error('CoreAdapter: 로그인 실패', error)
      throw error
    }
  }

  /**
   * 현재 사용자를 로그아웃
   * @throws Error - 로그아웃 중 발생한 에러
   */
  async signOut(): Promise<void> {
    Logger.debug('CoreAdapter: signOut 호출')
    try {
      await this.core.signOut()
      Logger.info('CoreAdapter: 로그아웃 성공')
    } catch (error) {
      Logger.error('CoreAdapter: 로그아웃 실패', error)
      throw error
    }
  }

  /**
   * 사용자의 로그인 상태를 확인
   * @returns boolean - 로그인 여부
   * @throws Error - 상태 확인 중 발생한 에러
   */
  async isLoggedIn(): Promise<boolean> {
    Logger.debug('CoreAdapter: isLoggedIn 호출')
    try {
      const isLoggedIn = await this.core.isLoggedIn()
      Logger.info('CoreAdapter: 로그인 상태 확인', { isLoggedIn })
      return isLoggedIn
    } catch (error) {
      Logger.error('CoreAdapter: 로그인 상태 확인 실패', error)
      throw error
    }
  }
}
