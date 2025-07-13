"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase, type UserProfile } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  subscription_status?: string
  signUp: (
    email: string,
    password: string,
    userData: Partial<UserProfile>,
    referralCode?: string,
  ) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>
  changePassword: (newPassword: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // 1. Fix: Centralizar estado de carga en getInitialSession
  const getInitialSession = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      const currentPath = window.location.pathname
      const publicRoutes = ["/", "/login", "/register", "/reset-password"]

      if (!session?.user) {
        if (!publicRoutes.includes(currentPath)) {
          setUser(null)
          setProfile(null)
          router.push("/login")
        }
      } else {
        setSession(session)
        setUser(session.user)
        await fetchUserProfile(session.user.id)
      }
    } catch (error) {
      console.error("Error fetching session:", error)
    } finally {
      setLoading(false)
    }
  }

  // 2. Fix: Suscripción a cambios de autenticación con manejo seguro
  useEffect(() => {
    const initializeAuth = async () => {
      // Primero obtenemos la sesión inicial
      await getInitialSession()

      // Luego nos suscribimos a cambios
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          try {
            setSession(session)
            setUser(session?.user ?? null)
            
            if (session?.user) {
              await fetchUserProfile(session.user.id)
            } else {
              setProfile(null)
            }
          } catch (error) {
            console.error("Auth state change error:", error)
          }
        }
      )

      return () => subscription.unsubscribe()
    }

    initializeAuth()
  }, [router])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Fetch profile error:", error)
        return
      }

      // 3. Fix: Asegurar tipo correcto del perfil
      setProfile(data ?? null)
    } catch (error) {
      console.error("Unexpected profile error:", error)
      setProfile(null)
    }
  }

  const signUp = async (
    email: string,
    password: string,
    userData: Partial<UserProfile>,
    referralCode?: string
  ) => {
    try {
      const metadata: any = {
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        phone: userData.phone || "",
        account_type: userData.account_type || "client",
      }

      if (referralCode?.trim()) {
        metadata.referred_by = referralCode.trim()
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: "https://foxlawyer.net/dashboard ",
          data: metadata,
        },
      })

      if (error) return { error }

      if (data.user && !data.user.email_confirmed_at) {
        setTimeout(async () => {
          try {
            const { error: profileError } = await supabase.from("profiles").upsert([
              {
                id: data.user!.id,
                email: data.user!.email!,
                first_name: userData.first_name || "",
                last_name: userData.last_name || "",
                phone: userData.phone || "",
                account_type: userData.account_type || "client",
                referred_by: referralCode?.trim() || null,
              },
            ], { onConflict: "id" })

            if (profileError) {
              console.error("Profile fallback error:", profileError)
            }
          } catch (err) {
            console.error("Fallback error:", err)
          }
        }, 1000)
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!error) {
        router.push("/dashboard")
      }

      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    try {
      console.log("Sign out iniciado...")
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error("Sign out error:", error)
      }

      // 4. Fix: Redirección segura sin eliminación manual de cookies
      await router.push("/login")
    } catch (err) {
      console.error("Error crítico:", err)
    } finally {
      setUser(null)
      setProfile(null)
      setSession(null)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://foxlawyer.vercel.app/reset-password ",
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: { message: "No user logged in." } }
    }
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single()

      if (error) return { error }

      setProfile(data ?? null)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const changePassword = async (newPassword: string) => {
    if (!user) {
      return { error: { message: "No user logged in." } }
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateUserProfile,
    changePassword,
    // Mantenemos compatibilidad con versiones anteriores
    subscription_status: profile?.subscription_status || undefined
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}