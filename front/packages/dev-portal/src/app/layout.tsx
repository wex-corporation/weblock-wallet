// src/app/layout.tsx
'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import '@/app/globals.css'

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
