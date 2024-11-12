// src/config.ts
export interface BaseUrlsConfig {
  local: string
  dev: string
  stage: string
  prod: string
}

export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId: string
}

export interface AppConfig {
  baseUrls: BaseUrlsConfig
  firebaseConfig: FirebaseConfig
}

export const defaultConfig: AppConfig = {
  baseUrls: {
    local: 'http://localhost:8080',
    dev: 'https://dev.alwallet.io',
    stage: 'https://staging.alwallet.io',
    prod: 'https://wallet.alwallet.io'
  },
  firebaseConfig: {
    apiKey: 'AIzaSyBiaHmiqmnUVtuCfKJ3yc9g1rdoSKCJYlE',
    authDomain: 'al-tech-704e2.firebaseapp.com',
    projectId: 'al-tech-704e2',
    storageBucket: 'al-tech-704e2.appspot.com',
    messagingSenderId: '79434562951',
    appId: '1:79434562951:web:25571fdadf346b9ad9e722',
    measurementId: 'G-KDKWTTVWD7'
  }
}
