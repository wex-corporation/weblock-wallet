export interface BaseUrls {
  local: string;
  dev: string;
  stage: string;
  prod: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export const defaultConfig = {
  baseUrls: {
    local: 'http://localhost:3000',
    dev: 'https://dev-api.wallet.com',
    stage: 'https://stage-api.wallet.com',
    prod: 'https://api.wallet.com',
  } as const,

  firebase: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  } as FirebaseConfig,
};
