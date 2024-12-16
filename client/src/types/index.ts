// src/types/index.ts

/**
 * SDK 초기화 옵션
 */
export interface SDKOptions {
  environment: 'local' | 'dev' | 'stage' | 'prod'
  apiKey: string
  orgHost: string
}

/**
 * 지갑 인터페이스
 */
export interface WalletAPI {
  /** 새 지갑 생성 */
  create(password: string): Promise<void>

  /** 기존 지갑 복구 */
  recover(password: string): Promise<void>

  /** 지갑 주소 조회 */
  getAddress(): Promise<string>
}

/**
 * 사용자 인증 인터페이스
 */
export interface UserAPI {
  /** Google OAuth 로그인 */
  signIn(): Promise<{ isNewUser: boolean }>

  /** 로그아웃 */
  signOut(): Promise<void>

  /** 로그인 상태 확인 */
  isLoggedIn(): Promise<boolean>
}

/**
 * 기본 에러 타입
 */
export class SDKError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'SDKError'
  }
}
