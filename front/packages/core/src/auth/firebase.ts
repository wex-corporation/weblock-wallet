import * as firebase from 'firebase/app'
import { getAuth, OAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { FirebaseConfig, FirebaseCredentials } from '@weblock-wallet/types'

export class Firebase {
  private firebaseConfig: FirebaseConfig

  constructor(firebaseConfig: FirebaseConfig) {
    this.firebaseConfig = firebaseConfig
    if (!firebase.getApps() || firebase.getApps().length === 0) {
      firebase.initializeApp(this.firebaseConfig)
    }
  }

  async signIn(provider: OAuthProvider): Promise<FirebaseCredentials> {
    const auth = getAuth()
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      const idToken = await user.getIdToken()

      if (!user) throw new Error('No user returned from Firebase')

      return {
        firebaseId: user.uid,
        email: user.email ?? '',
        idToken: idToken
      }
    } catch (error) {
      const customDataEmail =
        (error as { customData?: { email?: string } })?.customData?.email ??
        'N/A'
      console.error(
        'Error during Firebase authentication: %s,\n email: %s',
        error,
        customDataEmail
      )
      throw error
    }
  }

  async signOut(): Promise<void> {
    const auth = getAuth()
    await signOut(auth)
  }
}
