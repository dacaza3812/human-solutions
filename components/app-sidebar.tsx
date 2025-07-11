"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Home, Users, FileText, Settings, MessageCircle, UserPlus, PieChart, CreditCard, Contact } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"

export function AppSidebar() {
  const { profile } = useAuth()
  const pathname = usePathname()

  // Menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      { id: "overview", name: "Resumen", icon: Home, href: "/dashboard" },
      { id: "settings", name: "Configuración", icon: Settings, href: "/dashboard/settings" },
    ]

    if (profile?.account_type === "advisor") {
      return [
        ...baseItems.slice(0, 1), // Keep overview
        { id: "clients", name: "Clientes", icon: Users, href: "/dashboard/clients" },
        { id: "cases", name: "Casos", icon: FileText, href: "/dashboard/cases" },
        { id: "financial", name: "Vista Financiera", icon: PieChart, href: "/dashboard/financial" },
        { id: "messages", name: "Mensajes", icon: MessageCircle, href: "/dashboard/messages" },
        { id: "inquiries", name: "Contactos", icon: Contact, href: "/dashboard/inquiries" },
        ...baseItems.slice(1), // Keep settings
      ]
    } else {
      // Client menu
      return [
        ...baseItems.slice(0, 1), // Keep overview
        { id: "subscriptions", name: "Suscripciones", icon: CreditCard, href: "/dashboard/subscriptions" },
        { id: "referrals", name: "Referidos", icon: UserPlus, href: "/dashboard/referrals" },
        { id: "cases", name: "Mis Casos", icon: FileText, href: "/dashboard/cases" },
        { id: "messages", name: "Mensajes", icon: MessageCircle, href: "/dashboard/messages" },
        ...baseItems.slice(1), // Keep settings
      ]
    }
  }

  const sidebarItems = getMenuItems()

  // Check if current path matches menu item
  const isActiveRoute = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="flex items-center justify-center p-4">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <Image src="/fox-lawyer-logo.png" alt="Fox Lawyer" width={32} height={32} />
                <span className="text-xl font-bold">Fox Lawyer</span>
              </Link>
            </div>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild isActive={isActiveRoute(item.href)}>
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
