import { Firebase } from '../auth/firebase'
import { FirebaseUserInfo } from '../types/auth'
import { AvailableProviders } from '@wefunding-dev/wallet-types'

export class AuthModule {
  private firebase: Firebase

  constructor(firebase: Firebase) {
    this.firebase = firebase
  }

  async signInWithProvider(
    providerId: AvailableProviders
  ): Promise<FirebaseUserInfo> {
    try {
      return await this.firebase.signIn(providerId)
    } catch (error) {
      console.error('Firebase sign-in failed:', error)
      throw error
    }
  }

  async signOut(): Promise<void> {
    await this.firebase.signOut()
  }
}
