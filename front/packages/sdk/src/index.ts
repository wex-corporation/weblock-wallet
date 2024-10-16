// src/index.ts
import { Auth } from './auth/auth'
import { Wallets } from './wallets/wallets'
import { createHttpClient } from './utils/config'
import { SDKError } from './utils/errors'

/**
 * SDK 초기화 시 필요한 옵션 타입 정의
 */
interface SDKOptions {
  env: 'local' | 'dev' | 'stage' | 'prod' // 환경 설정
  apiKey: string // API 키
  orgHost: string // 조직 호스트 주소
}

/**
 * AlWalletSDK 클래스
 * - Auth와 Wallets 모듈을 제공하며 SDK의 진입점 역할을 수행
 */
export class AlWalletSDK {
  public auth: Auth // Auth 인스턴스
  public wallets: Wallets // Wallets 인스턴스

  constructor(options: SDKOptions) {
    try {
      const { env, apiKey, orgHost } = options
      console.log(`🚀 AlWalletSDK 초기화: ${env} 환경`)

      // WalletServerHttpClient 및 Firebase 설정 생성
      const { client, firebaseConfig } = createHttpClient(env, apiKey, orgHost)

      // Auth 및 Wallets 인스턴스 초기화
      this.auth = new Auth(client, firebaseConfig)
      this.wallets = new Wallets(client, orgHost)
    } catch (error) {
      console.error('SDK 초기화 오류:', error)
      const err = error as Error
      throw new SDKError(`SDK 초기화 중 오류가 발생했습니다: ${err.message}`)
    }
  }
}
