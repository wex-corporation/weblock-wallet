// src/index.ts
import { Auth } from './auth/auth'
import { Wallets } from './wallets/wallets'
import { Tokens } from './tokens/tokens'
import { Blockchains } from './blockchains/blockchains'
import { createHttpClient } from './utils/config'
import { SDKError } from './utils/errors'

// 명시적으로 타입, 클래스 내보내기
export { Coin, Blockchain, User, Wallet } from '@alwallet/core/src/domains'
export { TransactionStatus } from '@alwallet/core/src/types'

// Numbers 유틸리티 내보내기
export { Numbers } from '@alwallet/core/src/utils/numbers'
export { Time } from '@alwallet/core/src/utils/time'

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
  public auth: Auth
  public wallets: Wallets
  public tokens: Tokens
  public blockchains: Blockchains

  constructor(options: SDKOptions) {
    try {
      const { env, apiKey, orgHost } = options
      console.log(`🚀 AlWalletSDK 초기화: ${env} 환경`)

      // HTTP 클라이언트 및 Firebase 설정 생성
      const { client, firebaseConfig } = createHttpClient(env, apiKey, orgHost)

      // Auth 모듈 초기화
      this.auth = new Auth(client, firebaseConfig)

      // Wallets, Tokens, Blockchains 모듈 초기화
      this.wallets = new Wallets(client) // 지갑 관련 기능
      this.tokens = new Tokens(client, this.auth.getUsers()) // 토큰 관련 기능
      this.blockchains = new Blockchains(this.auth.getUsers()) // 블록체인 관련 기능
    } catch (error) {
      console.error('SDK 초기화 오류:', error)
      const err = error as Error
      throw new SDKError(`SDK 초기화 중 오류가 발생했습니다: ${err.message}`)
    }
  }
}
