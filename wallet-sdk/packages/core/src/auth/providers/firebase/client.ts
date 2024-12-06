import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
}

export class FirebaseClient {
  constructor(config: FirebaseConfig) {
    if (!getApps().length) {
      initializeApp(config);
    }
  }

  getAuth() {
    return getAuth();
  }
}
