import Link from 'next/link'

const docs = [
  { slug: 'getting-started', title: 'Getting Started' },
  { slug: 'installation', title: 'Installation' },
  { slug: 'api-reference', title: 'API Reference' }
]

export default function Sidebar() {
  return (
    <nav className="w-64 p-4 bg-gray-100">
      <ul className="space-y-2">
        {docs.map((doc) => (
          <li key={doc.slug}>
            <Link
              href={`/docs/${doc.slug}`}
              className="text-gray-800 hover:text-purple-600"
            >
              {doc.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
