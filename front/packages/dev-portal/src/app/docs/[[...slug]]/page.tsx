'use client'

import { allDocs } from 'contentlayer/generated'
import { useMDXComponent } from 'next-contentlayer/hooks'
import { notFound } from 'next/navigation'
import SidebarNav from '@/components/SidebarNav'

export default function DocPage({ params }: { params: { slug?: string[] } }) {
  const slug = params.slug ? params.slug.join('/') : 'getting-started'
  const doc = allDocs.find((doc) => doc.slug === slug)

  if (!doc) {
    notFound()
  }

  const MDXContent = useMDXComponent(doc.body.code)

  return (
    <div className="flex">
      {/* 사이드바 */}
      <aside className="w-64">
        <SidebarNav />
      </aside>
      {/* MDX 콘텐츠 */}
      <main className="flex-1 p-4">
        <h1 className="text-2xl font-bold">{doc.title}</h1>
        <MDXContent />
      </main>
    </div>
  )
}
