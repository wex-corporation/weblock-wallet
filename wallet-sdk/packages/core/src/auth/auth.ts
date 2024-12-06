import { FirebaseConfig } from './providers/firebase/client';
import { FirebaseGoogleProvider } from './providers/firebase/google';
import { AuthCredentials } from './providers/base';
import { SecureStorage } from '../utils/storage';
import { UserApiClient } from '../clients/users';
import { AvailableProviders } from '../types/auth';

export class Auth {
  private provider: FirebaseGoogleProvider;
  private storage: SecureStorage;
  private userClient: UserApiClient;

  constructor(
    config: FirebaseConfig,
    apiConfig: { baseURL: string; apiKey: string; orgHost: string }
  ) {
    this.provider = new FirebaseGoogleProvider(config);
    this.storage = SecureStorage.getInstance();
    this.userClient = new UserApiClient(apiConfig);
  }

  async signInWithGoogle(): Promise<{
    isNewUser: boolean;
    email: string;
    photoURL?: string;
  }> {
    try {
      // 1. Firebase 인증
      const credentials: AuthCredentials = await this.provider.signIn();

      // 2. 백엔드 인증
      const response = await this.userClient.signIn({
        firebaseId: credentials.providerId,
        email: credentials.email,
        idToken: credentials.idToken,
        provider: AvailableProviders.Google,
      });

      // 3. JWT 토큰 저장
      await this.storage.setToken(response.token);

      return {
        isNewUser: response.isNewUser,
        email: credentials.email,
        photoURL: credentials.photoURL,
      };
    } catch (error) {
      console.error('Auth sign-in failed:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.provider.signOut();
      await this.storage.removeToken();
    } catch (error) {
      console.error('Auth sign-out failed:', error);
      throw error;
    }
  }

  async getToken(): Promise<string | null> {
    return this.storage.getToken();
  }
}
