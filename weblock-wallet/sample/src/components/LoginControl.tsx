'use client'

import React, { useState } from 'react'
import { useSDK } from '../context/SDKContext'
import Card from './Card'
import UsageInfo from './UsageInfo'

const LoginControl = () => {
  const { isInitialized, isLoggedIn, login, logout } = useSDK()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    try {
      setError(null)
      setLoading(true)
      const result = await login()
      console.log('[LoginControl] 로그인 결과:', result)
      if (result.isNewUser) {
        console.log('[LoginControl] 신규 사용자입니다.')
      }
    } catch (err) {
      console.error('[LoginControl] 로그인 실패:', err)
      setError((err as Error)?.message || '알 수 없는 에러')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setError(null)
      setLoading(true)
      await logout()
    } catch (err) {
      console.error('[LoginControl] 로그아웃 실패:', err)
      setError((err as Error)?.message || '알 수 없는 에러')
    } finally {
      setLoading(false)
    }
  }

  const usageSteps = [
    'SDK 초기화가 완료되어야 합니다.',
    '로그인 버튼을 클릭하여 WeBlock 지갑에 연결합니다.',
    '지갑 연결 후 서비스를 이용할 수 있습니다.'
  ]

  const usageNotes = [
    '로그인은 WeBlock 지갑 앱을 통해 진행됩니다.',
    '지갑이 설치되어 있지 않은 경우 설치 페이지로 이동합니다.'
  ]

  if (!isInitialized) {
    return (
      <Card
        title="로그인"
        description="WeBlock 지갑 연결"
        usageInfo={<UsageInfo steps={usageSteps} notes={usageNotes} />}
      >
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <p className="text-yellow-600 text-center">
            SDK 초기화가 필요합니다.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card
      title="로그인"
      description="WeBlock 지갑 연결"
      usageInfo={<UsageInfo steps={usageSteps} notes={usageNotes} />}
    >
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        <div className="flex justify-center">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              disabled={loading}
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? '로그아웃 중...' : '로그아웃'}
            </button>
          ) : (
            <button
              onClick={handleLogin}
              disabled={loading}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}

export default LoginControl
