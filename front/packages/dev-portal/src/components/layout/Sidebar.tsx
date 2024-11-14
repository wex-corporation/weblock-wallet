// src/components/layout/Sidebar.tsx
import Link from 'next/link'

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-100 h-screen p-4 border-r">
      <nav className="space-y-2">
        <Link
          href="/docs"
          className="block p-2 text-gray-700 hover:bg-gray-200 rounded"
        >
          Getting Started
        </Link>
        <Link
          href="/docs/api"
          className="block p-2 text-gray-700 hover:bg-gray-200 rounded"
        >
          API Reference
        </Link>
        <Link
          href="/docs/guides"
          className="block p-2 text-gray-700 hover:bg-gray-200 rounded"
        >
          Guides
        </Link>
      </nav>
    </aside>
  )
}
