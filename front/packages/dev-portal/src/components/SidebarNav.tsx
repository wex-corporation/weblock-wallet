'use client'

import Link from 'next/link'
import { allDocs } from 'contentlayer/generated'

export default function SidebarNav() {
  return (
    <nav>
      <ul>
        {allDocs
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((doc) => (
            <li key={doc.slug}>
              <Link href={`/docs/${doc.slug}`}>{doc.title}</Link>
            </li>
          ))}
      </ul>
    </nav>
  )
}
