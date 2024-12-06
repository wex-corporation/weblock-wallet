export interface AuthProvider {
  signIn(): Promise<AuthCredentials>;
  signOut(): Promise<void>;
}

export interface AuthCredentials {
  providerId: string;
  email: string;
  idToken: string;
  photoURL?: string;
}
