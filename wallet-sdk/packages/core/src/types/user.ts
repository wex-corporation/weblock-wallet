export interface User {
  id: string;
  email: string;
  firebaseId: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  email: string;
  photoURL?: string;
}
