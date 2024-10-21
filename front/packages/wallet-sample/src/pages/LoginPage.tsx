import React from 'react'
import { AuthManager } from '@alwallet/sdk2' // SDK2의 AuthManager를 import

const LoginPage: React.FC = () => {
  const authManager = new AuthManager(
    'local',
    'MCowBQYDK2VwAyEASXmv-39yF5Wx1vX9lPuP7_9qgWVeGXMdAWr-TKalKMw=',
    'http://localhost:3000'
  )

  // Google 로그인을 처리하는 함수
  const handleLogin = async () => {
    try {
      await authManager.signInWithGoogle() // Google 로그인을 처리
      alert('Login Successful!')
    } catch (error) {
      console.error('Login Failed:', error)
      alert('Login Failed')
    }
  }

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-3xl font-bold text-center">Login with Google</h1>
      <button
        className="mt-4 bg-blue-500 text-white p-2 rounded mx-auto block"
        onClick={handleLogin}
      >
        Login with Google
      </button>
    </div>
  )
}

export default LoginPage
