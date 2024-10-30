// packages/wallet-sdk/src/core/auth.ts
import { Firebase } from '@alwallet/core'

export class Auth {
  private firebase: Firebase

  constructor(firebase: Firebase) {
    this.firebase = firebase
  }

  async signInWithGoogle(): Promise<void> {
    const provider = this.firebase.getGoogleProvider()
    await this.firebase.signIn(provider)
  }

  async signOut(): Promise<void> {
    await this.firebase.signOut()
  }
}
