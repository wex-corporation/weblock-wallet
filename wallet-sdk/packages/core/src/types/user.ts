import { BlockchainDTO } from './blockchain';

export interface UserDTO {
  id: string;
  orgId: string;
  email: string;
  firebaseId: string;
  provider: string;
  blockchains: BlockchainDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  email: string;
  photoURL?: string;
}
