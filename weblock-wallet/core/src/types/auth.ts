import { AvailableProviders } from '@wefunding-dev/wallet-types'

export interface FirebaseUserInfo {
  firebaseId: string
  email: string
  idToken: string
  photoURL?: string | null
}

export interface AuthResponse {
  isNewUser: boolean
  email: string
  photoURL?: string
}
