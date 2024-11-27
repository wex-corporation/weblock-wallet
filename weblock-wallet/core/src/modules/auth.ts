import { Firebase } from '../auth/firebase'
import { LocalForage } from '../utils/localForage'
import { Jwt } from '../utils/jwt'
import { FirebaseCredentials } from '@wefunding-dev/wallet-types'

export class AuthModule {
  private firebase: Firebase

  constructor(firebase: Firebase) {
    this.firebase = firebase
  }

  /**
   * Sign in using a specified OAuth provider.
   * @param providerId - The ID of the OAuth provider (e.g., 'google.com').
   */
  async signInWithProvider(providerId: string): Promise<void> {
    try {
      // Step 1: Sign in with Firebase
      const credentials: FirebaseCredentials = await this.firebase.signIn(
        providerId
      )

      // Step 2: Extract and validate token
      const accessToken = credentials.idToken
      const expiration = Jwt.parse(accessToken)?.exp
      if (!expiration) throw new Error('Invalid or missing token expiration.')

      // Step 3: Save necessary data to LocalForage
      await LocalForage.save('firebaseId', credentials.firebaseId)
      await LocalForage.save('email', credentials.email)
      await LocalForage.save('accessToken', accessToken, expiration)

      console.log('Sign-in successful. User data saved locally.')
    } catch (error) {
      console.error('Error during sign-in:', error)
      throw error
    }
  }

  /**
   * Sign out the currently logged-in user.
   */
  async signOut(): Promise<void> {
    try {
      // Clear Firebase session
      await this.firebase.signOut()

      // Remove locally stored data
      await LocalForage.delete('firebaseId')
      await LocalForage.delete('email')
      await LocalForage.delete('accessToken')

      console.log('Sign-out successful. Local data cleared.')
    } catch (error) {
      console.error('Error during sign-out:', error)
      throw error
    }
  }

  /**
   * Check if the user is currently logged in.
   * @returns boolean - True if the user is logged in, false otherwise.
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      const accessToken = await LocalForage.get<string>('accessToken')
      const firebaseId = await LocalForage.get<string>('firebaseId')

      const isLoggedIn = !!accessToken && !!firebaseId
      console.log('User login status:', isLoggedIn)
      return isLoggedIn
    } catch (error) {
      console.error('Error checking login status:', error)
      return false
    }
  }
}
