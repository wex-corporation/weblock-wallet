import { LoginProvider } from './Login'

export interface LoginResponse {
  walletId: string
  userId: string
  token: string
  provider: LoginProvider
  loginTime: Date
}

export interface AuthTokenResponse {
  idToken: string
  accessToken: string
  refreshToken: string
}
