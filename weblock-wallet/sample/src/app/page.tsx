'use client'

import SDKInitializer from '../components/SDKInitializer'
import LoginControl from '@/components/LoginControl'
import RequestResponseViewer from '@/components/RequestResponseViewer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 왼쪽: 문서 네비게이션 */}
      <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto h-screen sticky top-0">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-800">WeBlock Wallet</h1>
          <p className="text-sm text-gray-600 mt-1">SDK Documentation</p>
        </div>
        <nav className="p-4">
          <div className="space-y-1">
            <a
              href="#initialization"
              onClick={(e) => {
                e.preventDefault()
                document
                  .getElementById('initialization')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="block px-4 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
            >
              SDK 초기화
            </a>
            <a
              href="#authentication"
              onClick={(e) => {
                e.preventDefault()
                document
                  .getElementById('authentication')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="block px-4 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
            >
              인증
            </a>
            {/* 추가 네비게이션 아이템 */}
          </div>
        </nav>
      </div>

      {/* 오른쪽: 메인 콘텐츠 */}
      <div className="flex-1 min-w-0">
        <div className="container mx-auto py-12 px-8">
          <div className="grid grid-cols-12 gap-8">
            {/* 왼쪽: 실제 기능 */}
            <div className="col-span-7 space-y-8">
              <section id="initialization" className="scroll-mt-8">
                <SDKInitializer />
              </section>
              <section id="authentication" className="scroll-mt-8">
                <LoginControl />
              </section>
            </div>

            {/* 오른쪽: API 로그 */}
            <div className="col-span-5">
              <RequestResponseViewer />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
