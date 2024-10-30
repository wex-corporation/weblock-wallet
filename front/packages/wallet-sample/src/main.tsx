// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RecoilRoot } from 'recoil' // RecoilRoot 추가
import { WalletSdkProvider } from './context/WalletSdkContext'
import App from './App'
import './styles/index.css' // TailwindCSS 스타일 적용

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RecoilRoot> {/* RecoilRoot로 전체 앱을 감쌉니다 */}
      <WalletSdkProvider>
        <App />
      </WalletSdkProvider>
    </RecoilRoot>
  </React.StrictMode>
)
