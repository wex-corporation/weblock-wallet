export type EnvironmentType = 'local' | 'dev' | 'stage' | 'prod'

export interface WalletSDKConfig {
  /**
   * API 키 (필수)
   */
  apiKey: string

  /**
   * 사용 환경: local, dev, stage, prod 중 하나
   */
  env: EnvironmentType

  /**
   * 조직의 호스트 주소 (선택)
   */
  orgHost?: string
}
