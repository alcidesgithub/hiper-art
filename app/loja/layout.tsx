import type React from "react"
import { LojaSidebar } from "@/components/loja-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function LojaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <LojaSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
