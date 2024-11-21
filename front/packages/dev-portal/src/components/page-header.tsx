// src/components/page-header.tsx
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  children: React.ReactNode
}

export function PageHeader({ children }: PageHeaderProps) {
  return (
    <header className="py-8 border-b border-gray-200">
      <div className="container mx-auto">{children}</div>
    </header>
  )
}

interface HeadingProps {
  children: React.ReactNode
}

export function PageHeaderHeading({ children }: HeadingProps) {
  return <h1 className="text-3xl font-bold">{children}</h1>
}

export function PageHeaderDescription({ children }: HeadingProps) {
  return <p className="text-lg text-gray-600">{children}</p>
}
