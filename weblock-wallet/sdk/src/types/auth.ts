import { AvailableProviders } from '@wefunding-dev/wallet-types'
export { AvailableProviders }

/**
 * 인증 결과
 * @public
 */
export interface AuthResult {
  /** 신규 사용자 여부 */
  isNewUser: boolean
  /** 사용자 ID */
  userId: string
}
