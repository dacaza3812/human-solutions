"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // If authentication is still loading, do nothing.
    if (loading) {
      return
    }

    // If user is not logged in and not on a public route, redirect to login.
    // Public routes are /login, /register, /reset-password, and /payment_process
    const publicRoutes = ["/login", "/register", "/reset-password", "/payment_process"]
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

    if (!user && !isPublicRoute) {
      console.log("No user found, redirecting to login.")
      router.push("/login")
    } else if (user && (pathname === "/login" || pathname === "/register" || pathname === "/reset-password")) {
      // If user is logged in and tries to access login/register/reset-password, redirect to dashboard
      console.log("User logged in, redirecting from auth page to dashboard.")
      router.push("/dashboard")
    }
  }, [user, loading, router, pathname])

  // Show a loading indicator while authentication status is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  // Render children only if user is authenticated or on a public route
  // This prevents rendering protected content before auth status is known
  const publicRoutes = ["/login", "/register", "/reset-password", "/payment_process"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  if (user || isPublicRoute) {
    return <>{children}</>
  }

  // Fallback: Should ideally not be reached if redirects work correctly
  return null
}
