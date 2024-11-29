export interface SignInRequest {
  /**
   * Firebase 인증 ID
   */
  firebaseId: string

  /**
   * 사용자 이메일
   */
  email: string

  /**
   * 인증 토큰
   */
  idToken: string

  /**
   * OAuth 제공자 (google.com 등)
   */
  provider: string
}
