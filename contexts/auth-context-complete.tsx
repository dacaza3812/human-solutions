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
  signUp: (
    email: string,
    password: string,
    userData: Partial<UserProfile>,
    referralCode?: string,
  ) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        console.log("[AUTH] Initial session:", session?.user?.id || "No session")

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchUserProfile(session.user.id)
        }
      } catch (error) {
        console.error("[AUTH] Error getting initial session:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[AUTH] Auth state changed:", event, session?.user?.id || "No user")

      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("[AUTH] Fetching profile for user:", userId)

      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("[AUTH] Error fetching profile:", error)

        // Si el perfil no existe, esperar un momento y reintentar
        if (error.code === "PGRST116") {
          console.log("[AUTH] Profile not found, retrying in 2 seconds...")
          setTimeout(() => fetchUserProfile(userId), 2000)
        }
        return
      }

      console.log("[AUTH] Profile fetched successfully:", {
        id: data.id,
        email: data.email,
        referral_code: data.referral_code,
        referred_by: data.referred_by,
      })

      setProfile(data)
    } catch (error) {
      console.error("[AUTH] Unexpected error fetching profile:", error)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      console.log("[AUTH] Refreshing profile for user:", user.id)
      await fetchUserProfile(user.id)
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>, referralCode?: string) => {
    try {
      console.log("[AUTH] Starting signup process for:", email)
      console.log("[AUTH] User data:", userData)
      console.log("[AUTH] Referral code:", referralCode || "None")

      // Preparar metadatos
      const metadata: any = {
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        phone: userData.phone || "",
        account_type: userData.account_type || "client",
      }

      // Agregar código de referido si existe
      if (referralCode && referralCode.trim() !== "") {
        metadata.referral_code = referralCode.trim()
        console.log("[AUTH] Including referral code in metadata:", referralCode.trim())
      }

      console.log("[AUTH] Final metadata:", metadata)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: metadata,
        },
      })

      if (error) {
        console.error("[AUTH] Signup error:", error)
        return { error }
      }

      console.log("[AUTH] Signup successful:", data.user?.id)
      return { error: null }
    } catch (error) {
      console.error("[AUTH] Unexpected signup error:", error)
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log("[AUTH] Starting signin process for:", email)

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("[AUTH] Signin error:", error)
        return { error }
      }

      console.log("[AUTH] Signin successful")
      router.push("/dashboard")
      return { error: null }
    } catch (error) {
      console.error("[AUTH] Unexpected signin error:", error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      console.log("[AUTH] Attempting to sign out...")
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("[AUTH] Error during Supabase signOut:", error)
        alert("Error al cerrar sesión. Por favor, inténtalo de nuevo.")
        return
      }

      console.log("[AUTH] Supabase signOut successful. Clearing local state.")
      setSession(null) // Explicitly clear session state
      setUser(null) // Explicitly clear user state
      setProfile(null) // Explicitly clear profile state

      // Verify session after signOut
      const {
        data: { session: postSignOutSession },
      } = await supabase.auth.getSession()
      console.log("[AUTH] Session after signOut:", postSignOutSession?.user?.id || "No session (confirmed)")

      console.log("[AUTH] Redirecting to home page.")
      router.push("/")
      // router.refresh() // Optional: force a full page refresh if issues persist with cached content
    } catch (error) {
      console.error("[AUTH] Unexpected error during signOut:", error)
      alert("Ocurrió un error inesperado al cerrar sesión.")
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
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
    refreshProfile,
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
