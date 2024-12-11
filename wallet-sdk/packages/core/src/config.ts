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
    local: 'http://localhost:8080',
    dev: 'https://dev-api.wallet.com',
    stage: 'https://stage-api.wallet.com',
    prod: 'https://api.wallet.com',
  } as const,

  firebase: {
    apiKey: 'AIzaSyDXfrpfLOiDskQEc1PEP9j5HrGCLmtddRI',
    authDomain: 'rwx-wallet.firebaseapp.com',
    projectId: 'rwx-wallet',
    storageBucket: 'rwx-wallet.appspot.com',
    messagingSenderId: '397943391932',
    appId: '1:397943391932:web:5545b196b8a027c1c172b9',
    measurementId: 'G-V5YX6ECWTT',
  } as FirebaseConfig,
};
