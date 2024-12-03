import { Firebase } from '../auth/firebase'
import { FirebaseUserInfo } from '../types/auth'

export class AuthModule {
  private firebase: Firebase

  constructor(firebase: Firebase) {
    this.firebase = firebase
  }

  async signInWithProvider(providerId: string): Promise<FirebaseUserInfo> {
    try {
      const result = await this.firebase.signInWithPopup(providerId)
      const idToken = await result.user.getIdToken()

      return {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        idToken
      }
    } catch (error) {
      console.error('Firebase sign-in failed:', error)
      throw error
    }
  }

  async signOut(): Promise<void> {
    await this.firebase.signOut()
  }
}
