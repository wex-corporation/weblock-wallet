'use client'

import React from 'react'
import Card from './Card'
import UsageInfo from './UsageInfo'

const Installation = () => {
  const usageSteps = [
    {
      title: 'Package Installation',
      description: 'Install the WeBlock Wallet SDK using npm',
      code: 'npm install @wefunding-dev/wallet-sdk'
    },
    {
      title: 'Import SDK',
      description: 'Import the SDK in your project',
      code: "import { WalletSDK } from '@wefunding-dev/wallet-sdk'"
    },
    {
      title: 'Type Definitions',
      description: 'TypeScript type definitions are included in the package',
      code: "import type { WalletSDKConfig } from '@wefunding-dev/wallet-sdk'"
    }
  ]

  return (
    <Card
      title="설치하기"
      description="WeBlock Wallet SDK 설치 및 기본 설정"
      usageInfo={<UsageInfo steps={usageSteps} />}
    >
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-8 h-8 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              Latest Version
            </h3>
            <p className="text-sm text-gray-500">v1.0.0</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-gray-100 rounded px-4 py-2">
            <code className="text-sm text-gray-700">
              npm install @wefunding-dev/wallet-sdk
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  'npm install @wefunding-dev/wallet-sdk'
                )
              }}
              className="text-gray-400 hover:text-gray-600"
              title="Copy to clipboard"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default Installation
