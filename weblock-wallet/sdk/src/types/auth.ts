/**
 * 사용 가능한 인증 프로바이더
 * @public
 */
export enum AvailableProviders {
  Google = 'google.com',
  Facebook = 'facebook.com'
}

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
