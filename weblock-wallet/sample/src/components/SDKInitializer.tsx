'use client'

import React, { useState } from 'react'
import { useSDK } from '../context/SDKContext'
import Card from './Card'
import UsageInfo from './UsageInfo'

const SDKInitializer = () => {
  const { isInitialized, initializeSDK } = useSDK()
  const [apiKey, setApiKey] = useState(
    'MCowBQYDK2VwAyEASXmv-39yF5Wx1vX9lPuP7_9qgWVeGXMdAWr-TKalKMw='
  )
  const [env, setEnv] = useState<'local' | 'dev' | 'stage' | 'prod'>('local')
  const [error, setError] = useState<string | null>(null)

  const handleInitialize = () => {
    try {
      initializeSDK({
        apiKey,
        env,
        orgHost: 'http://localhost:3000'
      })
    } catch (err) {
      console.error('[SDKInitializer] 초기화 실패:', err)
      setError((err as Error)?.message || '알 수 없는 에러')
    }
  }

  const usageSteps = [
    'API Key를 입력하세요.',
    '환경(로컬/개발/스테이징/프로덕션)을 선택하세요.',
    '초기화 버튼을 클릭하여 SDK를 초기화합니다.'
  ]

  const usageNotes = [
    'API Key는 WeBlock 대시보드에서 확인할 수 있습니다.',
    '초기화는 앱 시작시 한 번만 수행하면 됩니다.'
  ]

  return (
    <Card
      title="SDK 초기화"
      description="WeBlock SDK를 초기화하여 서비스를 시작합니다."
      usageInfo={<UsageInfo steps={usageSteps} notes={usageNotes} />}
    >
      {!isInitialized ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">API Key:</label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Environment:
            </label>
            <select
              value={env}
              onChange={(e) =>
                setEnv(e.target.value as 'local' | 'dev' | 'stage' | 'prod')
              }
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="local">Local</option>
              <option value="dev">Dev</option>
              <option value="stage">Stage</option>
              <option value="prod">Prod</option>
            </select>
          </div>
          <button
            onClick={handleInitialize}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            초기화
          </button>
          {error && (
            <p className="text-red-500 text-sm mt-2">에러 발생: {error}</p>
          )}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <p className="text-green-600 text-center">
            SDK가 성공적으로 초기화되었습니다!
          </p>
        </div>
      )}
    </Card>
  )
}

export default SDKInitializer
