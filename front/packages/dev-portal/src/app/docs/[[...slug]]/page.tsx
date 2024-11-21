'use client'
import { allDocs } from 'contentlayer/generated'
import { useMDXComponent } from 'next-contentlayer/hooks'
import { notFound } from 'next/navigation'
import SidebarNav from '@/components/SidebarNav'
import { MDXComponents } from '@/components/MDXComponents'

export default function DocPage({ params }: { params: { slug?: string[] } }) {
  const slug = params.slug ? params.slug.join('/') : 'getting-started'
  const doc = allDocs.find((doc) => doc.slug === slug)

  if (!doc) {
    notFound()
  }

  const MDXContent = useMDXComponent(doc.body.code)

  return (
    <div className="flex">
      <aside className="w-64">
        <SidebarNav />
      </aside>
      <main className="flex-1 p-4">
        <h1 className="text-2xl font-bold">{doc.title}</h1>
        <MDXContent components={MDXComponents} />
      </main>
    </div>
  )
}
