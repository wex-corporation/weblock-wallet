// src/app/docs/page.tsx
import {
  PageHeader,
  PageHeaderHeading,
  PageHeaderDescription
} from '@/components/page-header'

export default function DocsPage() {
  return (
    <div>
      <PageHeader>
        <PageHeaderHeading>Documentation</PageHeaderHeading>
        <PageHeaderDescription>
          Find the information you need to integrate with our platform.
        </PageHeaderDescription>
      </PageHeader>
      {/* 추가 콘텐츠 작성 */}
    </div>
  )
}
