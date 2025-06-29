import { BarChart, Calendar, FileText, Home, Lock, Settings, TestTube, User, UserPlus } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MainNav } from "@/components/main-nav"
import { ModeToggle } from "@/components/mode-toggle"
import Link from "next/link"

const links = [
  {
    href: "/dashboard",
    label: "Inicio",
  },
  {
    href: "/dashboard/analytics",
    label: "Analíticas",
  },
  {
    href: "/dashboard/billing",
    label: "Facturación",
  },
  {
    href: "/dashboard/settings",
    label: "Ajustes",
  },
]

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden border-r bg-gray-100/40 dark:bg-gray-800/40 md:block w-64 shrink-0">
        <div className="flex h-20 items-center justify-between border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <FileText className="h-6 w-6" />
            <span>Acme Inc</span>
          </Link>
        </div>
        <div className="flex flex-col gap-2 px-6 py-4">
          <p className="text-sm font-medium">Navegación</p>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
          >
            <Home className="h-4 w-4" />
            Inicio
          </Link>
          <Link
            href="/dashboard/analytics"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
          >
            <BarChart className="h-4 w-4" />
            Analíticas
          </Link>
          <Link
            href="/dashboard/billing"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
          >
            <Calendar className="h-4 w-4" />
            Facturación
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
          >
            <Settings className="h-4 w-4" />
            Ajustes
          </Link>
          <Link
            href="/dashboard/test"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
          >
            <TestTube className="h-4 w-4" />
            Prueba
          </Link>
        </div>
        <div className="mt-auto border-t px-6 py-4">
          <p className="text-sm font-medium">Tu cuenta</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex h-8 w-full items-center justify-between rounded-lg px-3 py-2">
                <Avatar className="mr-2 h-5 w-5">
                  <AvatarImage src="/avatars/01.png" alt="Avatar" />
                  <AvatarFallback>OM</AvatarFallback>
                </Avatar>
                <span>Omar</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" forceMount className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Ajustes</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Lock className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
      <div className="flex flex-col flex-1">
        <header className="flex h-20 items-center border-b px-6">
          <MainNav className="mx-6" links={links} />
          <div className="ml-auto flex items-center space-x-4">
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/01.png" alt="Avatar" />
                    <AvatarFallback>OM</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" forceMount className="w-56">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>Invitar a un amigo</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Ajustes</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Lock className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center p-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold">Panel de Control</h1>
            <p>
              Este es un panel de control de ejemplo creado con Next.js y componentes de interfaz de usuario de Radix.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
