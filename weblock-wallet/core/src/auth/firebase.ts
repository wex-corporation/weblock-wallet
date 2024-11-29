import * as firebase from 'firebase/app'
import { getAuth, OAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { defaultConfig } from '../config'
import { FirebaseCredentials } from '@wefunding-dev/wallet-types'

export class Firebase {
  private auth

  constructor() {
    if (!firebase.getApps().length) {
      firebase.initializeApp(defaultConfig.firebaseConfig)
    }
    this.auth = getAuth()
  }

  async signIn(providerId: string): Promise<FirebaseCredentials> {
    const provider = new OAuthProvider(providerId)
    const result = await signInWithPopup(this.auth, provider)
    const user = result.user

    if (!user) throw new Error('No user returned from Firebase')

    const idToken = await user.getIdToken()

    return {
      firebaseId: user.uid,
      email: user.email ?? '',
      idToken
    }
  }

  async signOut(): Promise<void> {
    await signOut(this.auth)
  }
}
