// types/auth.ts
import { Blockchain } from './blockchain'
export enum AvailableProviders {
  Google = 'google.com'
  // 필요한 경우 다른 provider 추가
}

export interface SignInRequest {
  firebaseId: string
  email: string
  idToken: string
  provider: AvailableProviders
}

export interface SignInResponse {
  token: string
  isNewUser: boolean
}

export interface User {
  id: string
  orgId: string
  email: string
  firebaseId: string
  provider: string
  blockchains: Blockchain[]
}

export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId: string
}

export interface FirebaseCredentials {
  firebaseId: string
  email: string
  idToken: string
}

export interface CoreConfig {
  baseUrl: string
  firebaseConfig: FirebaseConfig
  apiKey: string
  orgHost: string
}
