'use client'

import React, { useState } from 'react'
import { useSDK } from '../context/SDKContext'

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

  return (
    <div className="p-4 border rounded shadow-md bg-white w-full max-w-md">
      <h2 className="text-xl font-bold mb-2">SDK 초기화</h2>
      {!isInitialized && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">API Key:</label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Environment:
            </label>
            <select
              value={env}
              onChange={(e) =>
                setEnv(e.target.value as 'local' | 'dev' | 'stage' | 'prod')
              }
              className="w-full px-3 py-2 border rounded"
            >
              <option value="local">Local</option>
              <option value="dev">Dev</option>
              <option value="stage">Stage</option>
              <option value="prod">Prod</option>
            </select>
          </div>
          <button
            onClick={handleInitialize}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
          >
            초기화
          </button>
          {error && <p className="text-red-500 mt-2">에러 발생: {error}</p>}
        </>
      )}
      {isInitialized && (
        <p className="text-green-500 mt-4">
          SDK가 성공적으로 초기화되었습니다!
        </p>
      )}
    </div>
  )
}

export default SDKInitializer
