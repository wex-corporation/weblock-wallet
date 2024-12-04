export interface FirebaseUserInfo {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  idToken: string
}

export interface UserInfo {
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export interface AuthResponse {
  isNewUser: boolean
  user: UserInfo
  token: string
}
