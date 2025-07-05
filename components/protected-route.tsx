"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, profile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        // If user is logged in but role is not allowed, redirect to dashboard or an unauthorized page
        router.push("/dashboard") // Or a specific unauthorized page
      }
    }
  }, [user, loading, profile, allowedRoles, router])

  if (loading || !user || (allowedRoles && profile && !allowedRoles.includes(profile.role))) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
      </div>
    )
  }

  return <>{children}</>
}
