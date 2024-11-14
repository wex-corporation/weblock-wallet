// src/components/layout/Header.tsx
import { NavigationMenu } from '@/components/ui/navigation-menu'

export default function Header() {
  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold">Developer Portal</h1>
        <NavigationMenu />
      </div>
    </header>
  )
}
