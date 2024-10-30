export enum TransactionStatus {
  FAILURE = 'failure',
  SUCCESS = 'success',
  PENDING = 'pending'
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
