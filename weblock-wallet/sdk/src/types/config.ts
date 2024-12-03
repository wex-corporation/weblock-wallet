/**
 * SDK 초기화 설정
 * @public
 */
export interface WalletSDKConfig {
  /** API 키 */
  apiKey: string
  /** 환경 설정 */
  env: 'local' | 'dev' | 'stage' | 'prod'
  /** 조직 호스트 URL (선택) */
  orgHost?: string
}
