export enum AvailableProviders {
  Google = 'google.com',
}

export interface AuthCredentials {
  firebaseId: string;
  email: string;
  idToken: string;
  provider: AvailableProviders;
}

export interface AuthResponse {
  token: string;
  isNewUser: boolean;
  email: string;
  photoURL?: string;
}
