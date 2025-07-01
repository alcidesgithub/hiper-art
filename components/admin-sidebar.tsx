"use client"

import { Building2, PlayIcon as Campaign, Users, LayoutDashboard, LogOut, Palette } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Gerenciar Lojas",
    url: "/admin/lojas",
    icon: Building2,
  },
  {
    title: "Gerenciar Campanhas",
    url: "/admin/campanhas",
    icon: Campaign,
  },
  {
    title: "Gerador de Artes",
    url: "/admin/gerador-artes",
    icon: Palette,
  },
  {
    title: "Gerenciar Administradores",
    url: "/admin/administradores",
    icon: Users,
  },
]

export function AdminSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.clear()
    router.push("/")
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-4 py-2 bg-white flex flex-col items-center justify-center">
          <img src="/assets/logo-hiperfarma.png" alt="Rede Hiperfarma Logo" className="max-h-24 w-auto mb-1" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4">
          <Button variant="outline" className="w-full bg-sidebar text-sidebar-foreground" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
