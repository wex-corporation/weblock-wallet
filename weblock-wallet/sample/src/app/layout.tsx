'use client'

import './globals.css'
import { SDKProvider } from '../context/SDKContext'

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="h-full bg-gray-50 text-gray-800 antialiased">
        <SDKProvider>
          <div className="min-h-full relative">{children}</div>
        </SDKProvider>
      </body>
    </html>
  )
}
