export interface UserInfo {
  email: string
  displayName: string
  photoURL: string
}

export interface SignInResponse {
  isNewUser: boolean
  userInfo: UserInfo
  accessToken: string
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
