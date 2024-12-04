// auth.ts

export enum AvailableProviders {
  Google = 'google.com'
}

export interface FirebaseCredentials {
  firebaseId: string
  email: string
  idToken: string
  photoURL?: string | null
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

export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId: string
}
