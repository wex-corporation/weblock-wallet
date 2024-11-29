import { Firebase } from '../auth/firebase'
import { LocalForage } from '../utils/localForage'
import { Jwt } from '../utils/jwt'
import { FirebaseCredentials } from '@wefunding-dev/wallet-types'

export class AuthModule {
  private firebase: Firebase

  constructor(firebase: Firebase) {
    this.firebase = firebase
  }

  async signInWithProvider(providerId: string): Promise<void> {
    try {
      const credentials: FirebaseCredentials =
        await this.firebase.signIn(providerId)
      const accessToken = credentials.idToken
      const expiration = Jwt.parse(accessToken)?.exp
      if (!expiration) throw new Error('Invalid or missing token expiration.')

      await LocalForage.save('firebaseId', credentials.firebaseId)
      await LocalForage.save('email', credentials.email)
      await LocalForage.save('accessToken', accessToken, expiration)

      console.log('Sign-in successful. User data saved locally.')
    } catch (error) {
      console.error('Error during sign-in:', error)
      throw error
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.firebase.signOut()
      await LocalForage.delete('firebaseId')
      await LocalForage.delete('email')
      await LocalForage.delete('accessToken')

      console.log('Sign-out successful. Local data cleared.')
    } catch (error) {
      console.error('Error during sign-out:', error)
      throw error
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      const accessToken = await LocalForage.get<string>('accessToken')
      const firebaseId = await LocalForage.get<string>('firebaseId')
      return !!accessToken && !!firebaseId
    } catch (error) {
      console.error('Error checking login status:', error)
      return false
    }
  }
}
