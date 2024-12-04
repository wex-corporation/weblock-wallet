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
    {
      title: 'Installation',
      description: 'Install the WeBlock Wallet SDK package',
      code: 'npm install @wefunding-dev/wallet-sdk'
    },
    {
      title: 'Import SDK',
      description: 'Import the SDK and required types',
      code: `import { WalletSDK, WalletSDKConfig } from '@wefunding-dev/wallet-sdk'`
    },
    {
      title: 'Create Instance',
      description: 'Create and initialize SDK instance with configuration',
      code: `const sdk = new WalletSDK()
sdk.initialize({
  apiKey: 'YOUR_API_KEY',
  env: 'dev',
  orgHost: 'your-organization-host'
})`
    },
    {
      title: 'Verify Initialization',
      description: 'Check if SDK is properly initialized',
      code: `if (sdk.isInitialized()) {
  console.log('SDK is ready to use')
}`
    }
  ]

  const interfaceInfo = {
    name: 'WalletSDKConfig',
    description: 'Configuration interface for SDK initialization',
    properties: [
      {
        name: 'apiKey',
        type: 'string',
        description: 'API key from WeBlock Dashboard',
        required: true
      },
      {
        name: 'env',
        type: "'local' | 'dev' | 'stage' | 'prod'",
        description: 'Environment configuration',
        required: true
      },
      {
        name: 'orgHost',
        type: 'string',
        description: 'Organization host URL',
        required: true
      }
    ]
  }

  return (
    <Card
      title="SDK 초기화"
      description="WeBlock SDK를 초기화하여 서비스를 시작합니다"
      usageInfo={<UsageInfo steps={usageSteps} interfaceInfo={interfaceInfo} />}
    >
      {!isInitialized ? (
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          )}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Environment
              </label>
              <select
                value={env}
                onChange={(e) =>
                  setEnv(e.target.value as 'local' | 'dev' | 'stage' | 'prod')
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="local">Local</option>
                <option value="dev">Development</option>
                <option value="stage">Staging</option>
                <option value="prod">Production</option>
              </select>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleInitialize}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              SDK 초기화
            </button>
          </div>
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
