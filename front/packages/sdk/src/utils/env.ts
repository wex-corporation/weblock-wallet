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
    apiKey: 'AIzaSyBiaHmiqmnUVtuCfKJ3yc9g1rdoSKCJYlE',
    authDomain: 'al-tech-704e2.firebaseapp.com',
    projectId: 'al-tech-704e2',
    storageBucket: 'al-tech-704e2.appspot.com',
    messagingSenderId: '79434562951',
    appId: '1:79434562951:web:25571fdadf346b9ad9e722',
    measurementId: 'G-KDKWTTVWD7'
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
