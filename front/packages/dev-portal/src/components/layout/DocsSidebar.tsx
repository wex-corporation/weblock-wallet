// src/components/layout/DocsSidebar.tsx
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar'
import Link from 'next/link'

const docsSections = [
  { title: 'Introduction', url: '/docs/introduction' },
  { title: 'Getting Started', url: '/docs/getting-started' },
  { title: 'API Overview', url: '/docs/api-overview' },
  { title: 'Examples', url: '/docs/examples' },
  { title: 'FAQ', url: '/docs/faq' }
]

export default function DocsSidebar() {
  return (
    <Sidebar className="w-64 h-full bg-sidebar text-sidebar-foreground">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Documentation</SidebarGroupLabel>
          <SidebarMenu>
            {docsSections.map((section) => (
              <SidebarMenuItem key={section.title}>
                <SidebarMenuButton asChild>
                  <Link href={section.url}>{section.title}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
