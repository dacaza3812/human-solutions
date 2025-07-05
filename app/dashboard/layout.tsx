import { SidebarProvider } from "@/components/ui/sidebar"
import type React from "react"
import Link from "next/link"
import { Home, Briefcase, Users, MessageSquare, DollarSign, Settings, FileText, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthProvider } from "@/contexts/auth-context"
import ProtectedRoute from "@/components/protected-route"
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
  SidebarRail,
  SidebarTrigger,
  SidebarInset,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import Image from "next/image"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <SidebarProvider defaultOpen={true}>
          <Sidebar collapsible="icon">
            <SidebarHeader>
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                <Image src="/fox-lawyer-logo.png" alt="Fox Lawyer Logo" width={32} height={32} className="mr-2" />
                <span className="group-data-[collapsible=icon]:hidden">Fox Lawyer</span>
              </Link>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>General</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard">
                          <Home className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard/cases">
                          <Briefcase className="h-4 w-4" />
                          <span>Casos</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard/clients">
                          <Users className="h-4 w-4" />
                          <span>Clientes</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard/inquiries">
                          <FileText className="h-4 w-4" />
                          <span>Consultas</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard/messages">
                          <MessageSquare className="h-4 w-4" />
                          <span>Mensajes</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard/quotes">
                          <DollarSign className="h-4 w-4" />
                          <span>Presupuestos</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard/calendar">
                          <CalendarDays className="h-4 w-4" />
                          <span>Calendario</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              <SidebarSeparator />
              <SidebarGroup>
                <SidebarGroupLabel>Finanzas</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard/subscriptions">
                          <DollarSign className="h-4 w-4" />
                          <span>Suscripciones</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard/referrals">
                          <Users className="h-4 w-4" />
                          <span>Referidos</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/settings">
                      <Settings className="h-4 w-4" />
                      <span>Configuración</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <ThemeToggle />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>
          <SidebarInset>
            <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
              <SidebarTrigger className="-ml-2" />
              <div className="w-full flex-1">
                <h1 className="font-semibold text-lg">Dashboard</h1>
              </div>
              <div className="flex items-center gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <img src="/placeholder-user.jpg" width="32" height="32" className="rounded-full" alt="Avatar" />
                        <span className="sr-only">Toggle user menu</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Perfil de Usuario</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    </AuthProvider>
  )
}
