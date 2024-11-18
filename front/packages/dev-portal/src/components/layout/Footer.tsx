// src/components/Footer.tsx
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-6 mt-10">
      <div className="container mx-auto flex flex-col items-center space-y-4 text-sm text-gray-600">
        <div className="flex space-x-6">
          <Link href="/page/terms-of-use" className="hover:underline">
            Terms of Use
          </Link>
          <Link href="/page/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/page/sdk-license" className="hover:underline">
            SDK License Terms
          </Link>
        </div>
        <p>
          &copy; {new Date().getFullYear()} WeBlock Wallet. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
