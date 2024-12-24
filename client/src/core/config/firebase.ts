export const getFirebaseConfig = (
  environment: 'local' | 'dev' | 'stage' | 'prod'
) => {
  const config = {
    local: {
      apiKey: 'AIzaSyDXfrpfLOiDskQEc1PEP9j5HrGCLmtddRI',
      authDomain: 'rwx-wallet.firebaseapp.com',
      projectId: 'rwx-wallet',
      storageBucket: 'rwx-wallet.appspot.com',
      messagingSenderId: '397943391932',
      appId: '1:397943391932:web:5545b196b8a027c1c172b9',
      measurementId: 'G-V5YX6ECWTT',
    },
    dev: {
      apiKey: 'AIzaSyDXfrpfLOiDskQEc1PEP9j5HrGCLmtddRI',
      authDomain: 'rwx-wallet.firebaseapp.com',
      projectId: 'rwx-wallet',
      storageBucket: 'rwx-wallet.appspot.com',
      messagingSenderId: '397943391932',
      appId: '1:397943391932:web:5545b196b8a027c1c172b9',
      measurementId: 'G-V5YX6ECWTT',
    },
    stage: {
      apiKey: 'AIzaSyDXfrpfLOiDskQEc1PEP9j5HrGCLmtddRI',
      authDomain: 'rwx-wallet.firebaseapp.com',
      projectId: 'rwx-wallet',
      storageBucket: 'rwx-wallet.appspot.com',
      messagingSenderId: '397943391932',
      appId: '1:397943391932:web:5545b196b8a027c1c172b9',
      measurementId: 'G-V5YX6ECWTT',
    },
    prod: {
      apiKey: "AIzaSyDXfrpfLOiDskQEc1PEP9j5HrGCLmtddRI",
      authDomain: "rwx-wallet.firebaseapp.com",
      projectId: "rwx-wallet",
      storageBucket: "rwx-wallet.firebasestorage.app",
      messagingSenderId: "397943391932",
      appId: "1:397943391932:web:5545b196b8a027c1c172b9",
      measurementId: "G-V5YX6ECWTT"
    },
  }

  return config[environment]
}
