// src/app/page.tsx
import {
  PageHeader,
  PageHeaderHeading,
  PageHeaderDescription
} from '@/components/page-header'

export default function HomePage() {
  return (
    <div>
      <PageHeader>
        <PageHeaderHeading>Welcome to the Developer Portal</PageHeaderHeading>
        <PageHeaderDescription>
          Easily manage your Dapp integration and API keys.
        </PageHeaderDescription>
      </PageHeader>
      {/* 추가 콘텐츠 작성 */}
    </div>
  )
}
