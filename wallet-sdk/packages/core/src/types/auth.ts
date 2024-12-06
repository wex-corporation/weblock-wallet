import { UserDTO } from './user';

export enum AvailableProviders {
  Google = 'google.com',
}

export interface SignInRequest {
  firebaseId: string;
  email: string;
  idToken: string;
  provider: AvailableProviders;
}

export interface SignInResponse {
  token: string;
  isNewUser: boolean;
  user: UserDTO;
}
