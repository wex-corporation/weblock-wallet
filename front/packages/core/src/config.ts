import { AppConfig } from '@weblock-wallet/types'

export const defaultConfig: AppConfig = {
  baseUrls: {
    local: 'http://localhost:8080',
    dev: 'https://dev.alwallet.io',
    stage: 'https://staging.alwallet.io',
    prod: 'https://wallet.alwallet.io'
  },
  firebaseConfig: {
    apiKey: 'AIzaSyDXfrpfLOiDskQEc1PEP9j5HrGCLmtddRI',
    authDomain: 'rwx-wallet.firebaseapp.com',
    projectId: 'rwx-wallet',
    storageBucket: 'rwx-wallet.appspot.com',
    messagingSenderId: '397943391932',
    appId: '1:397943391932:web:5545b196b8a027c1c172b9',
    measurementId: 'G-V5YX6ECWTT'
  }
}
