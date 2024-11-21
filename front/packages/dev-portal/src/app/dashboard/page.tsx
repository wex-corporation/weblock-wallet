// import { useEffect, useState } from 'react'
// import PageContainer from '@/components/layout/PageContainer'
// import { Core, LocalForage } from '@weblock-wallet/core'
// import { AvailableProviders, Organization } from '@weblock-wallet/types'

// export default function Dashboard() {
//   const [core, setCore] = useState<Core | null>(null) // 현재 선택된 Core
//   const [loggedIn, setLoggedIn] = useState(false)
//   const [developerInfo, setDeveloperInfo] = useState<{
//     firebaseId: string
//     email: string
//   } | null>(null)
//   const [organizations, setOrganizations] = useState<Organization[]>([]) // 모든 조직 목록
//   const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null) // 현재 선택된 조직
//   const [allowedHosts, setAllowedHosts] = useState<string[]>([]) // 선택된 조직의 allowed-hosts
//   const [newHost, setNewHost] = useState('')

//   // Core 인스턴스 초기화
//   useEffect(() => {
//     const coreInstance = new Core(
//       'local',
//       'MCowBQYDK2VwAyEASXmv-39yF5Wx1vX9lPuP7_9qgWVeGXMdAWr-TKalKMw=',
//       'http://localhost:3000'
//     )
//     setCore(coreInstance)
//     console.log('Core instance initialized.')
//   }, [])

//   // 개발자 로그인 핸들러
//   const handleDeveloperSignIn = async () => {
//     try {
//       if (!core) {
//         console.error('Core instance not initialized.')
//         return
//       }

//       console.log('Attempting developer sign-in...')
//       await core.developerSignIn(AvailableProviders.Google)

//       const firebaseId = await LocalForage.get<string>(
//         `${core.getOrgHost()}:firebaseId`
//       )
//       const email = await LocalForage.get<string>(`${core.getOrgHost()}:email`)

//       console.log('Retrieved from LocalForage:', { firebaseId, email })

//       if (firebaseId && email) {
//         setLoggedIn(true)
//         setDeveloperInfo({ firebaseId, email })

//         // 조직 목록 가져오기
//         const orgClient = core.getOrganizations()
//         const orgs = await orgClient.getOrganizations() // 조직 목록 API 호출
//         setOrganizations(orgs)
//         console.log('Developer signed in. Retrieved organizations:', orgs)
//       }
//     } catch (error) {
//       console.error('Error during developer sign-in:', error)
//     }
//   }

//   // 조직 선택 핸들러
//   const handleSelectOrganization = async (organization: Organization) => {
//     try {
//       console.log('Selecting organization:', organization)

//       // Core 초기화
//       const orgCore = new Core(
//         'local',
//         organization.apiKey,
//         organization.orgHost
//       )
//       setCore(orgCore)
//       setSelectedOrg(organization)

//       console.log('Core initialized for selected organization:', organization)

//       // Allowed hosts 불러오기
//       const orgClient = orgCore.getOrganizations()
//       const hosts = await orgClient.getAllowedHosts()
//       setAllowedHosts(hosts)
//       console.log('Retrieved allowed hosts:', hosts)
//     } catch (error) {
//       console.error('Error selecting organization:', error)
//     }
//   }

//   // Allowed Host 추가 핸들러
//   const handleAddHost = async () => {
//     try {
//       if (!core || !selectedOrg) {
//         console.error('Core instance or selected organization not initialized.')
//         return
//       }

//       console.log(
//         `Adding allowed host: ${newHost} to organization: ${selectedOrg.name}`
//       )
//       const orgClient = core.getOrganizations()
//       await orgClient.addAllowedHost(newHost)

//       setAllowedHosts((prev) => [...prev, newHost])
//       setNewHost('')
//       console.log('Allowed host added successfully:', newHost)
//     } catch (error) {
//       console.error('Error adding allowed host:', error)
//     }
//   }

//   return (
//     <PageContainer>
//       <h1 className="text-2xl font-bold">Dashboard</h1>

//       {loggedIn ? (
//         <div>
//           <p>Welcome, {developerInfo?.email || 'Developer'}!</p>
//           <p>Firebase ID: {developerInfo?.firebaseId || 'N/A'}</p>

//           <button
//             className="px-4 py-2 bg-red-500 text-white rounded mt-4"
//             onClick={() => setLoggedIn(false)}
//           >
//             Log Out
//           </button>

//           {/* 조직 선택 */}
//           <div className="mt-6">
//             <h2 className="text-xl font-semibold">Your Organizations</h2>
//             <ul className="mt-4">
//               {organizations.map((org) => (
//                 <li key={org.id} className="mt-2">
//                   <button
//                     className="px-4 py-2 bg-blue-500 text-white rounded"
//                     onClick={() => handleSelectOrganization(org)}
//                   >
//                     {org.name}
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* 선택된 조직 */}
//           {selectedOrg && (
//             <div className="mt-6">
//               <h2 className="text-xl font-semibold">
//                 Organization: {selectedOrg.name}
//               </h2>
//               <p>API Key: {selectedOrg.apiKey}</p>

//               <h3 className="text-lg font-medium mt-4">Allowed Hosts</h3>
//               <ul className="mt-4">
//                 {allowedHosts.map((host, index) => (
//                   <li key={index}>{host}</li>
//                 ))}
//               </ul>

//               <input
//                 type="text"
//                 className="border p-2 mt-2"
//                 placeholder="Enter new host"
//                 value={newHost}
//                 onChange={(e) => setNewHost(e.target.value)}
//               />
//               <button
//                 className="px-4 py-2 bg-green-500 text-white rounded mt-4"
//                 onClick={handleAddHost}
//               >
//                 Add Host
//               </button>
//             </div>
//           )}
//         </div>
//       ) : (
//         <div>
//           <p>Please log in to access your dashboard.</p>
//           <button
//             className="px-4 py-2 bg-blue-500 text-white rounded mt-4"
//             onClick={handleDeveloperSignIn}
//           >
//             Log In with Google
//           </button>
//         </div>
//       )}
//     </PageContainer>
//   )
// }

'use client'

import { useEffect, useState } from 'react'
import PageContainer from '@/components/layout/PageContainer'
import { Core } from '@weblock-wallet/core'

interface Organization {
  id: string
  name: string
  apiKey: string
  orgHost: string
  allowedHosts: string[]
}

export default function Dashboard() {
  const [core, setCore] = useState<Core | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [allowedHosts, setAllowedHosts] = useState<string[]>([])
  const [newHost, setNewHost] = useState('')

  // Simulate loading organizations
  useEffect(() => {
    const dummyOrganizations = [
      {
        id: 'org1',
        name: 'Organization 1',
        apiKey: 'dummyApiKey1',
        orgHost: 'http://localhost:3000',
        allowedHosts: ['http://localhost:3000', 'http://localhost:3333']
      },
      {
        id: 'org2',
        name: 'Organization 2',
        apiKey: 'dummyApiKey2',
        orgHost: 'http://localhost:3001',
        allowedHosts: ['http://localhost:3001']
      }
    ]

    setOrganizations(dummyOrganizations)
    console.log('Simulated organizations loaded:', dummyOrganizations)
  }, [])

  const handleSelectOrganization = async (organization: Organization) => {
    try {
      console.log('Selecting organization:', organization)

      // Simulate Core initialization
      setCore(new Core('local', organization.apiKey, organization.orgHost))
      setSelectedOrg(organization)

      // Simulate fetching allowed hosts
      setAllowedHosts(organization.allowedHosts || [])
      console.log('Simulated allowed hosts loaded:', organization.allowedHosts)
    } catch (error) {
      console.error('Error selecting organization:', error)
    }
  }

  const handleAddHost = async () => {
    try {
      if (!selectedOrg) {
        console.error('No organization selected.')
        return
      }

      console.log(
        `Simulating adding allowed host: ${newHost} to ${selectedOrg.name}`
      )

      // Update allowedHosts in local state
      setAllowedHosts((prev) => [...prev, newHost])
      setNewHost('')
      console.log('Simulated: Allowed host added successfully:', newHost)
    } catch (error) {
      console.error('Error adding allowed host:', error)
    }
  }

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {loggedIn ? (
        <div>
          {/* Organization List */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold">Your Organizations</h2>
            <ul className="mt-4">
              {organizations.map((org) => (
                <li key={org.id} className="mt-2">
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={() => handleSelectOrganization(org)}
                  >
                    {org.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Selected Organization */}
          {selectedOrg && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold">
                Organization: {selectedOrg.name}
              </h2>
              <p>API Key: {selectedOrg.apiKey}</p>

              <h3 className="text-lg font-medium mt-4">Allowed Hosts</h3>
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
                className="px-4 py-2 bg-green-500 text-white rounded mt-4"
                onClick={handleAddHost}
              >
                Add Host
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <p>Please log in to access your dashboard.</p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded mt-4"
            onClick={() => setLoggedIn(true)}
          >
            Log In
          </button>
        </div>
      )}
    </PageContainer>
  )
}
