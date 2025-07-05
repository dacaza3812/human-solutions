import type React from "react"
import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Home,
  Briefcase,
  MessageCircle,
  DollarSign,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Mail,
  CalendarDays,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("name, avatar_url, role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    console.error("Error fetching profile:", profileError)
    // Handle error, maybe redirect to an error page or show a message
    redirect("/error") // Or a more appropriate error handling
  }

  const isAdvisor = profile.role === "advisor"

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Casos", href: "/dashboard/cases", icon: Briefcase },
    { name: "Mensajes", href: "/dashboard/messages", icon: MessageCircle },
    { name: "Cotizaciones", href: "/dashboard/quotes", icon: DollarSign },
    { name: "Citas", href: "/dashboard/calendar", icon: CalendarDays },
  ]

  if (isAdvisor) {
    navigationItems.push(
      { name: "Clientes", href: "/dashboard/clients", icon: Users },
      { name: "Consultas", href: "/dashboard/inquiries", icon: Mail },
      { name: "Referidos", href: "/dashboard/referrals", icon: FileText },
    )
  }

  navigationItems.push({ name: "Suscripción", href: "/dashboard/subscriptions", icon: DollarSign })
  navigationItems.push({ name: "Configuración", href: "/dashboard/settings", icon: Settings })

  const userInitials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email?.[0]?.toUpperCase() || "U"

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
        <nav className="flex-1 overflow-auto py-4">
          <ul className="grid gap-2 px-4">
            {navigationItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile.avatar_url || "/placeholder-user.jpg"} alt={profile.name || "User"} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{profile.name || "Usuario"}</span>
                  <span className="text-xs text-muted-foreground">{profile.role}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Configuración</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/support">Soporte</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <form action="/auth/sign-out" method="post" className="w-full">
                  <button type="submit" className="flex w-full items-center gap-2 text-destructive">
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
        {/* Header for Mobile */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden bg-transparent">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col sm:max-w-xs">
              <div className="flex h-16 items-center justify-between border-b px-4">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <Image src="/fox-lawyer-logo.png" alt="Fox Lawyer" width={24} height={24} />
                  <span className="text-lg">Fox Lawyer</span>
                </Link>
                <SheetTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close Menu</span>
                  </Button>
                </SheetTrigger>
              </div>
              <nav className="flex-1 overflow-auto py-4">
                <ul className="grid gap-2 px-4">
                  {navigationItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto border-t p-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile.avatar_url || "/placeholder-user.jpg"} alt={profile.name || "User"} />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">{profile.name || "Usuario"}</span>
                        <span className="text-xs text-muted-foreground">{profile.role}</span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings">Configuración</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/support">Soporte</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <form action="/auth/sign-out" method="post" className="w-full">
                        <button type="submit" className="flex w-full items-center gap-2 text-destructive">
                          <LogOut className="h-4 w-4" />
                          Cerrar Sesión
                        </button>
                      </form>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex-1" />
          <ThemeToggle />
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">{children}</main>
      </div>
    </div>
  )
}
