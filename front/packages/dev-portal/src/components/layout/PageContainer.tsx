// src/components/layout/PageContainer.tsx
import { ReactNode } from 'react'

export default function PageContainer({ children }: { children: ReactNode }) {
  return <div className="max-w-4xl mx-auto px-4 py-6">{children}</div>
}
