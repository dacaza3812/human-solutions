"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  HomeIcon,
  Briefcase,
  Users,
  MessageSquare,
  DollarSign,
  Settings,
  Menu,
  X,
  LogOut,
  ClipboardList,
  Handshake,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { signOut } = useAuth()

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Casos", href: "/dashboard/cases", icon: Briefcase },
    { name: "Clientes", href: "/dashboard/clients", icon: Users },
    { name: "Consultas", href: "/dashboard/inquiries", icon: ClipboardList },
    { name: "Mensajes", href: "/dashboard/messages", icon: MessageSquare },
    { name: "Cotizaciones", href: "/dashboard/quotes", icon: DollarSign },
    { name: "Referidos", href: "/dashboard/referrals", icon: Handshake },
    { name: "Suscripciones", href: "/dashboard/subscriptions", icon: DollarSign },
    { name: "Configuración", href: "/dashboard/settings", icon: Settings },
  ]

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {/* Sidebar for Desktop */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Image src="/fox-lawyer-logo.png" alt="Fox Lawyer" width={24} height={24} />
            <span className="text-lg">Fox Lawyer</span>
          </Link>
          <ThemeToggle />
        </div>
        <nav className="flex flex-col gap-2 p-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                pathname === item.href ? "bg-muted text-primary" : ""
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
          <Button
            variant="ghost"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </nav>
      </aside>

      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
        {/* Header for Mobile and Desktop */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden bg-transparent">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Navigation Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col sm:max-w-xs">
              <div className="flex h-16 items-center justify-between border-b px-4">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <Image src="/fox-lawyer-logo.png" alt="Fox Lawyer" width={24} height={24} />
                  <span className="text-lg">Fox Lawyer</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="grid gap-2 p-4 text-lg font-medium">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground ${
                      pathname === item.href ? "bg-muted text-foreground" : ""
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
                <Button
                  variant="ghost"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    signOut()
                    setMobileMenuOpen(false)
                  }}
                >
                  <LogOut className="h-5 w-5" />
                  Cerrar Sesión
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex-1" />
          <ThemeToggle className="hidden sm:flex" />
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">{children}</main>
      </div>
    </div>
  )
}
