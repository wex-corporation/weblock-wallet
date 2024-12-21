import { initializeApp, FirebaseApp, getApps } from 'firebase/app'
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
  OAuthProvider,
} from 'firebase/auth'
import { SDKError, SDKErrorCode } from '../../types/error'
import { SDKOptions } from '../../types'
import { getFirebaseConfig } from '../config/firebase'

// 반환 타입 정의
interface FirebaseCredentials {
  firebaseId: string
  email: string
  idToken: string
  photoURL: string | null
}

export class FirebaseAuth {
  private readonly app: FirebaseApp
  private readonly auth: Auth

  constructor(options: SDKOptions) {
    // 앱 중복 초기화 방지
    if (!getApps().length) {
      this.app = initializeApp(getFirebaseConfig(options.environment))
    } else {
      this.app = getApps()[0]
    }
    this.auth = getAuth(this.app)
  }

  async signIn(provider: string): Promise<FirebaseCredentials> {
    try {
      const result = await signInWithPopup(
        this.auth,
        new OAuthProvider(provider)
      )

      const user = result.user
      if (!user) {
        throw new SDKError(
          'No user returned from Firebase',
          SDKErrorCode.AUTH_NO_USER
        )
      }

      if (!user.email) {
        throw new SDKError('User email is required', SDKErrorCode.AUTH_NO_EMAIL)
      }

      const idToken = await user.getIdToken()

      return {
        firebaseId: user.uid,
        email: user.email,
        idToken,
        photoURL: user.photoURL,
      }
    } catch (error) {
      if (error instanceof SDKError) {
        throw error
      }

      throw new SDKError(
        'Firebase authentication failed',
        SDKErrorCode.AUTH_PROVIDER_ERROR,
        error
      )
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.auth.signOut()
    } catch (error) {
      throw new SDKError(
        'Failed to sign out',
        SDKErrorCode.AUTH_SIGNOUT_FAILED,
        error
      )
    }
  }

  isLoggedIn(): boolean {
    return this.auth.currentUser !== null
  }
}
