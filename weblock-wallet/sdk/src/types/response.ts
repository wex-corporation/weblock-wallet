export interface SignInResponse {
  /**
   * 새 사용자 여부
   */
  isNewUser: boolean
}

export interface UserResponse {
  /**
   * 사용자 고유 ID
   */
  userId: string

  /**
   * 사용자 이메일
   */
  email: string

  /**
   * 사용자 이름
   */
  displayName: string
}
