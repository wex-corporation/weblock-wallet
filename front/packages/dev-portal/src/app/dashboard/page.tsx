'use client'

import { useEffect, useState } from 'react'
import PageContainer from '@/components/layout/PageContainer'
import { Core, LocalForage } from '@weblock-wallet/core'
import { AvailableProviders } from '@weblock-wallet/types'

export default function Dashboard() {
  const [core, setCore] = useState<Core | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [developerInfo, setDeveloperInfo] = useState<{
    firebaseId: string
    email: string
  } | null>(null)
  const [organizationName, setOrganizationName] = useState('')
  const [allowedHosts, setAllowedHosts] = useState<string[]>([])
  const [newHost, setNewHost] = useState('')
  const [apiKeyPair, setApiKeyPair] = useState<{
    apiKey: string
    secretKey: string
  } | null>(null)

  // Core 인스턴스 초기화
  useEffect(() => {
    const coreInstance = new Core(
      'local',
      'MCowBQYDK2VwAyEASXmv-39yF5Wx1vX9lPuP7_9qgWVeGXMdAWr-TKalKMw=',
      'http://localhost:3000'
    )
    setCore(coreInstance)
    console.log('Core instance initialized.')
  }, [])

  // 개발자 로그인 핸들러
  const handleDeveloperSignIn = async () => {
    try {
      if (!core) {
        console.error('Core instance not initialized.')
        return
      }

      console.log('Attempting developer sign-in...')
      await core.developerSignIn(AvailableProviders.Google)

      const firebaseId = await LocalForage.get<string>(
        `${core.getOrgHost()}:firebaseId`
      )
      const email = await LocalForage.get<string>(`${core.getOrgHost()}:email`)

      console.log('Retrieved from LocalForage:', { firebaseId, email })

      if (firebaseId && email) {
        setLoggedIn(true)
        setDeveloperInfo({ firebaseId, email })
        console.log('Developer signed in:', { firebaseId, email })
      }
    } catch (error) {
      console.error('Error during developer sign-in:', error)
    }
  }

  // 개발자 로그아웃 핸들러
  const handleDeveloperSignOut = async () => {
    try {
      if (!core) {
        console.error('Core instance not initialized.')
        return
      }

      console.log('Attempting developer sign-out...')
      await core.developerSignOut()

      setLoggedIn(false)
      setDeveloperInfo(null)
      console.log('Developer signed out.')
    } catch (error) {
      console.error('Error during developer sign-out:', error)
    }
  }

  // 조직 생성 핸들러
  const handleCreateOrganization = async () => {
    try {
      if (!core) {
        console.error('Core instance not initialized.')
        return
      }

      console.log(`Creating organization with name: ${organizationName}`)
      const organization = await core.createOrganizationsWithUser(
        organizationName
      )
      setApiKeyPair(organization)

      console.log('Organization created:', organization)

      // Allowed Hosts 업데이트
      setAllowedHosts(['http://localhost:3000', 'http://localhost:3001'])

      console.log('Allowed hosts set to default.')

      // Core 재초기화
      console.log('Reinitializing Core with new API key...')
      const newCoreInstance = new Core(
        'local',
        organization.apiKey,
        'http://localhost:3000'
      )
      setCore(newCoreInstance)

      console.log('Core re-initialized for new organization:', organization)
    } catch (error) {
      console.error('Error during organization creation:', error)
    }
  }

  // Allowed Host 추가 핸들러
  const handleAddHost = async () => {
    try {
      if (!core) {
        console.error('Core instance not initialized.')
        return
      }

      console.log(`Adding allowed host: ${newHost}`)
      const organizations = core.getOrganizations()
      await organizations.addAllowedHost(newHost)

      setAllowedHosts((prev) => [...prev, newHost])
      setNewHost('')
      console.log('Allowed host added:', newHost)
    } catch (error) {
      console.error('Error adding allowed host:', error)
    }
  }

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {loggedIn ? (
        <div>
          <p>Welcome, {developerInfo?.email || 'Developer'}!</p>
          <p>Firebase ID: {developerInfo?.firebaseId || 'N/A'}</p>

          <button
            className="px-4 py-2 bg-red-500 text-white rounded mt-4"
            onClick={handleDeveloperSignOut}
          >
            Log Out
          </button>

          <div className="mt-6">
            <h2 className="text-xl font-semibold">Create Organization</h2>
            <input
              type="text"
              className="border p-2 mt-2"
              placeholder="Enter organization name"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
            />
            <button
              className="px-4 py-2 bg-green-500 text-white rounded mt-4"
              onClick={handleCreateOrganization}
            >
              Create Organization
            </button>
            {apiKeyPair && (
              <div className="mt-4">
                <p>API Key: {apiKeyPair.apiKey}</p>
                <p>Secret Key: {apiKeyPair.secretKey}</p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold">Allowed Hosts</h2>
            <ul className="mt-4">
              {allowedHosts.map((host, index) => (
                <li key={index}>{host}</li>
              ))}
            </ul>

            <input
              type="text"
              className="border p-2 mt-2"
              placeholder="Enter new host"
              value={newHost}
              onChange={(e) => setNewHost(e.target.value)}
            />
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded mt-4"
              onClick={handleAddHost}
            >
              Add Host
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p>Please log in to access your dashboard.</p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded mt-4"
            onClick={handleDeveloperSignIn}
          >
            Log In with Google
          </button>
        </div>
      )}
    </PageContainer>
  )
}
