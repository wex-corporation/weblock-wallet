'use client'

import { useEffect, useState } from 'react'
import { Core } from '@weblock-wallet/core'
import { AvailableProviders } from '@weblock-wallet/types'

const core = new Core(
  'local',
  'MCowBQYDK2VwAyEASXmv-39yF5Wx1vX9lPuP7_9qgWVeGXMdAWr-TKalKMw=',
  'http://localhost:3000'
)

export default function DevPortalPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [orgName, setOrgName] = useState('')

  const handleLogin = async () => {
    try {
      await core.developerSignIn(AvailableProviders.Google)
      setIsLoggedIn(true)
      console.log('Developer 로그인 성공')
    } catch (error) {
      console.error('Developer 로그인 실패:', error)
    }
  }

  const handleCreateOrganization = async () => {
    if (!isLoggedIn) {
      console.error('먼저 로그인하세요.')
      return
    }

    try {
      const { apiKey } = await core.createOrganizations(orgName)
      setApiKey(apiKey)
      console.log('조직 생성 성공:', apiKey)
    } catch (error) {
      console.error('조직 생성 실패:', error)
    }
  }

  return (
    <div>
      <h1>개발자 포털</h1>
      {!isLoggedIn ? (
        <button onClick={handleLogin}>로그인</button>
      ) : (
        <div>
          <input
            type="text"
            placeholder="조직 이름 입력"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          />
          <button onClick={handleCreateOrganization}>
            조직 생성 및 API 키 발급
          </button>
        </div>
      )}
      {apiKey && (
        <div>
          <h2>발급된 API 키</h2>
          <p>{apiKey}</p>
        </div>
      )}
    </div>
  )
}
