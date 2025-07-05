import type React from "react"
import { getSupabaseServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/ui/sidebar"
import { HomeIcon, UsersIcon, MessageSquareIcon, SettingsIcon, FileQuestionIcon } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MenuIcon } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("role, username, avatar_url")
    .eq("id", user.id)
    .single()

  if (profileError || !profileData) {
    console.error("Error fetching profile:", profileError)
    // Handle error, maybe redirect to a profile setup page or show a generic error
    redirect("/login") // Or a more appropriate error page
  }

  const userRole = profileData.role
  const username = profileData.username || user.email
  const avatarUrl = profileData.avatar_url || "/placeholder-user.jpg"

  const navigationItems = [
    {
      href: "/dashboard",
      icon: HomeIcon,
      text: "Dashboard",
      roles: ["client", "advisor"],
    },
    {
      href: "/dashboard/cases",
      icon: FileQuestionIcon,
      text: "Casos",
      roles: ["client", "advisor"],
    },
    {
      href: "/dashboard/messages",
      icon: MessageSquareIcon,
      text: "Mensajes",
      roles: ["client", "advisor"],
    },
    {
      href: "/dashboard/inquiries", // New inquiries route
      icon: FileQuestionIcon, // Using FileQuestionIcon for inquiries, can be changed
      text: "Contactos",
      roles: ["advisor"], // Only advisors can see this
    },
    {
      href: "/dashboard/referrals",
      icon: UsersIcon,
      text: "Referidos",
      roles: ["advisor"],
    },
    {
      href: "/dashboard/subscriptions",
      icon: HomeIcon, // Placeholder, consider a more relevant icon
      text: "Suscripciones",
      roles: ["client", "advisor"],
    },
    {
      href: "/dashboard/settings",
      icon: SettingsIcon,
      text: "Configuración",
      roles: ["client", "advisor"],
    },
  ]

  const filteredNavigation = navigationItems.filter((item) => item.roles.includes(userRole))

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop Sidebar */}
      <Sidebar navigation={filteredNavigation} userRole={userRole} className="hidden lg:flex" />

      <div className="flex flex-col flex-1">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="lg:hidden bg-transparent">
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
                  <Image src="/fox-lawyer-logo.png" alt="Fox Lawyer" width={24} height={24} />
                  <span>Fox Lawyer</span>
                </Link>
                {filteredNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.text}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="relative ml-auto flex-1 md:grow-0">{/* Search or other header content */}</div>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={username || "User"} />
                  <AvatarFallback>{username ? username[0].toUpperCase() : "U"}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Mi Perfil</DropdownMenuItem>
              <DropdownMenuItem>Configuración</DropdownMenuItem>
              <DropdownMenuItem>Soporte</DropdownMenuItem>
              <DropdownMenuItem>
                <form action="/auth/sign-out" method="post" className="w-full">
                  <button type="submit" className="w-full text-left">
                    Cerrar Sesión
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
      </div>
    </div>
  )
}
