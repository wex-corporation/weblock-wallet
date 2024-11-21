// src/components/app-sidebar.tsx
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'

import { Calendar, Home, Inbox, Settings } from 'lucide-react'

// Sidebar 메뉴 항목 설정
const items = [
  { title: '대시보드', url: '/', icon: Home },
  { title: 'Dapp 등록', url: '/dapp-register', icon: Inbox },
  { title: 'API 키 관리', url: '/api-keys', icon: Calendar },
  { title: '설정', url: '/settings', icon: Settings }
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar">
      <SidebarHeader>My Dev Portal</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>© 2024 My Dev Portal</SidebarFooter>
    </Sidebar>
  )
}
