'use client'

import SDKInitializer from '../components/SDKInitializer'
import LoginControl from '@/components/LoginControl'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-6">WeBlock Wallet Sample</h1>
      <div className="w-full max-w-2xl space-y-6">
        {/* SDK 초기화 컴포넌트 */}
        <SDKInitializer />

        {/* 로그인 컨트롤 컴포넌트 */}
        <LoginControl />
      </div>
    </div>
  )
}
