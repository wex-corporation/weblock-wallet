'use client'

import { useEffect, useState } from 'react'
import PageContainer from '@/components/layout/PageContainer'
import { Core } from '@weblock-wallet/core'
import { AvailableProviders } from '@weblock-wallet/types'

export default function Dashboard() {
  const [core, setCore] = useState<Core | null>(null)
  const [orgHost, setOrgHost] = useState<string>('')
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    async function initializeCore() {
      try {
        // 기본 Core 인스턴스 초기화
        const coreInstance = new Core(
          'local',
          'MCowBQYDK2VwAyEASXmv-39yF5Wx1vX9lPuP7_9qgWVeGXMdAWr-TKalKMw=',
          'http://localhost:3000'
        )
        setCore(coreInstance)

        // 조직 생성
        const organization = await coreInstance.createOrganizations(
          'My First Dapp'
        )
        console.log('Organization created:', organization)

        // 발급받은 orgHost 설정
        // setOrgHost(organization.host)

        // Core를 orgHost로 다시 초기화
        const initializedCore = new Core(
          'local',
          organization.apiKey,
          organization.host
        )
        setCore(initializedCore)
        console.log('Core initialized with orgHost:', organization.host)

        // 개발자 로그인
        await initializedCore.developerSignIn(AvailableProviders.Google)
        setLoggedIn(true)
        console.log('Developer signed in!')
      } catch (error) {
        console.error('Error initializing Core:', error)
      }
    }

    initializeCore()
  }, [])

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {loggedIn ? (
        <p>Welcome to your dashboard!</p>
      ) : (
        <p>Please wait while we set things up...</p>
      )}
    </PageContainer>
  )
}
