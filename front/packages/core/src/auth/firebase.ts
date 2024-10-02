import * as firebase from 'firebase/app'
import { getAuth, OAuthProvider, signInWithPopup, signOut } from 'firebase/auth'

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

export class Firebase {
  private firebaseConfig: FirebaseConfig

  constructor(firebaseConfig: FirebaseConfig) {
    this.firebaseConfig = firebaseConfig
    if (!firebase.getApps() || firebase.getApps().length == 0) {
      firebase.initializeApp(this.firebaseConfig)
    }
  }

  async signIn(provider: OAuthProvider): Promise<FirebaseCredentials> {
    const auth = getAuth()
    return await signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user
        const idToken = await user.getIdToken()
        if (user) {
          return {
            firebaseId: user.uid,
            email: user.email!,
            idToken: idToken
          }!
        } else {
          throw new Error('No user returned from Firebase')
        }
      })
      .catch((error) => {
        console.error(
          'Error during Firebase authentication: {},\n email: {}',
          error,
          error.customData.email
        )
        throw error
      })
  }

  async signOut(): Promise<void> {
    const auth = getAuth()
    await signOut(getAuth())
  }
}
