'use client'

import SDKInitializer from '../components/SDKInitializer'
import LoginControl from '@/components/LoginControl'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          WeBlock Wallet Sample
        </h1>
        <div className="max-w-2xl mx-auto space-y-6">
          <SDKInitializer />
          <LoginControl />
        </div>
      </div>
    </div>
  )
}
