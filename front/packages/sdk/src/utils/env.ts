// src/utils/env.ts
export const getBaseUrls = (env: string): string => {
  switch (env) {
    case 'local':
      return 'http://localhost:8080'
    case 'dev':
      return 'https://dev.alwallet.io'
    case 'stage':
      return 'https://staging.alwallet.io'
    case 'prod':
      return 'https://wallet.alwallet.io'
    default:
      throw new Error('Invalid environment')
  }
}

export const getFirebaseConfig = (env: string) => {
  const config = {
    apiKey: 'AIzaSyDXfrpfLOiDskQEc1PEP9j5HrGCLmtddRI',
    authDomain: 'rwx-wallet.firebaseapp.com',
    projectId: 'rwx-wallet',
    storageBucket: 'rwx-wallet.appspot.com',
    messagingSenderId: '397943391932',
    appId: '1:397943391932:web:5545b196b8a027c1c172b9',
    measurementId: 'G-V5YX6ECWTT'
  }

  switch (env) {
    case 'local':
    case 'dev':
    case 'stage':
    case 'prod':
      return config
    default:
      throw new Error('Invalid environment')
  }
}
