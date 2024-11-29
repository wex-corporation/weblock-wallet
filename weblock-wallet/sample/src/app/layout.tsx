'use client'

import './globals.css' // TailwindCSS 및 전역 스타일 포함
import { SDKProvider } from '../context/SDKContext'

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800">
        <SDKProvider>
          <main className="container mx-auto py-6">{children}</main>
        </SDKProvider>
      </body>
    </html>
  )
}
