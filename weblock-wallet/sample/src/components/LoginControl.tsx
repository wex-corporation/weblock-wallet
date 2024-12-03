'use client'

import React, { useState } from 'react'
import { useSDK } from '../context/SDKContext'
import Card from './Card'
import UsageInfo from './UsageInfo'

const LoginControl = () => {
  const { isInitialized, isLoggedIn, login, logout } = useSDK()
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    try {
      setError(null)
      await login()
    } catch (err) {
      console.error('[LoginControl] 로그인 실패:', err)
      setError((err as Error)?.message || '알 수 없는 에러')
    }
  }

  const handleLogout = async () => {
    try {
      setError(null)
      await logout()
    } catch (err) {
      console.error('[LoginControl] 로그아웃 실패:', err)
      setError((err as Error)?.message || '알 수 없는 에러')
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
        {isLoggedIn ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <p className="text-green-600 text-center">
                WeBlock 지갑이 연결되었습니다!
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              연결 해제
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            지갑 연결하기
          </button>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-600 text-sm text-center">
              에러 발생: {error}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

export default LoginControl
