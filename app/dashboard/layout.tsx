import { AvatarFallback } from "@/components/ui/avatar"
import { Avatar } from "@/components/ui/avatar"
import type { ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Bell,
  Home,
  LineChart,
  Package2,
  Users,
  Menu,
  MessageSquare,
  Briefcase,
  Settings,
  Handshake,
  Calendar,
  FileText,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthProvider } from "@/contexts/auth-context"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"

interface DashboardLayoutProps {
  children: ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user profile to determine role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError) {
    console.error("Error fetching user profile:", profileError)
    // Handle error, maybe redirect to an error page or show a message
    redirect("/login") // Or a more appropriate error handling
  }

  const userRole = profile?.role || "client" // Default to client if role is not found

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home, roles: ["admin", "advisor", "client"] },
    { name: "Casos", href: "/dashboard/cases", icon: Briefcase, roles: ["admin", "advisor", "client"] },
    { name: "Consultas", href: "/dashboard/inquiries", icon: MessageSquare, roles: ["admin", "advisor"] },
    { name: "Clientes", href: "/dashboard/clients", icon: Users, roles: ["admin", "advisor"] },
    { name: "Cotizaciones", href: "/dashboard/quotes", icon: FileText, roles: ["admin", "advisor"] },
    { name: "Referidos", href: "/dashboard/referrals", icon: Handshake, roles: ["admin", "advisor"] },
    { name: "Suscripciones", href: "/dashboard/subscriptions", icon: CreditCard, roles: ["admin", "client"] },
    { name: "Calendario", href: "/dashboard/calendar", icon: Calendar, roles: ["admin", "advisor", "client"] },
    { name: "Reportes", href: "/dashboard/reports", icon: LineChart, roles: ["admin", "advisor"] },
    { name: "Configuración", href: "/dashboard/settings", icon: Settings, roles: ["admin", "advisor", "client"] },
  ]

  const filteredNavigation = navigationItems.filter((item) => item.roles.includes(userRole))

  return (
    <AuthProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <Image src="/fox-lawyer-logo.png" alt="Fox Lawyer" width={24} height={24} />
                <span className="">Fox Lawyer</span>
              </Link>
              <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Toggle notifications</span>
              </Button>
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {filteredNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="mt-auto p-4">{/* Future content like subscription status or quick links */}</div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-transparent">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                <nav className="grid gap-2 text-lg font-medium">
                  <Link href="#" className="flex items-center gap-2 text-lg font-semibold">
                    <Package2 className="h-6 w-6" />
                    <span className="sr-only">Fox Lawyer</span>
                  </Link>
                  {filteredNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto">{/* Mobile future content */}</div>
              </SheetContent>
            </Sheet>
            <div className="w-full flex-1">{/* Search or other header content */}</div>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarFallback>{user?.email ? user.email[0].toUpperCase() : "U"}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/dashboard/settings">
                  <DropdownMenuItem>Configuración</DropdownMenuItem>
                </Link>
                <DropdownMenuItem>Soporte</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Cerrar Sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{children}</main>
        </div>
      </div>
    </AuthProvider>
  )
}
