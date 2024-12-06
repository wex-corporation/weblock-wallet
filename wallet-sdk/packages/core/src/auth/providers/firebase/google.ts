import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { AuthProvider, AuthCredentials } from '../base';
import { FirebaseClient, FirebaseConfig } from './client';

export class FirebaseGoogleProvider implements AuthProvider {
  private client: FirebaseClient;

  constructor(config: FirebaseConfig) {
    this.client = new FirebaseClient(config);
  }

  async signIn(): Promise<AuthCredentials> {
    try {
      const auth = this.client.getAuth();
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      return {
        providerId: result.user.uid,
        email: result.user.email || '',
        idToken,
        photoURL: result.user.photoURL || undefined,
      };
    } catch (error) {
      console.error('Google sign-in failed:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    const auth = this.client.getAuth();
    await auth.signOut();
  }
}
