"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

// Define el tipo para el perfil de usuario
interface UserProfile {
  id: string
  first_name?: string | null
  last_name?: string | null
  account_type?: string | null
  phone?: string | null
  created_at?: string | null
  referral_code?: string | null
  stripe_customer_id?: string | null
}

// Define el tipo para el contexto de autenticación
interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    accountType: string,
    referralCode?: string,
  ) => Promise<{ user: User | null; error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>
  signOut: () => Promise<{ error: Error | null }>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<{ profile: UserProfile | null; error: Error | null }>
  changePassword: (newPassword: string) => Promise<{ error: Error | null }>
}

// Crea el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Proveedor del contexto de autenticación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user and profile on mount
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      if (error) {
        console.error("Error getting session:", error)
      }
      setUser(session?.user || null)
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      }
      setLoading(false)
    }

    getSession()

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      authListener?.unsubscribe()
    }
  }, [])

  const fetchUserProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error fetching profile:", error)
      setProfile(null)
      return null
    }
    setProfile(data as UserProfile)
    return data as UserProfile
  }, [])

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      accountType: string,
      referralCode?: string,
    ) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            account_type: accountType,
            referral_code: referralCode || null,
          },
        },
      })

      if (error) {
        console.error("Error signing up:", error)
        return { user: null, error }
      }
      setUser(data.user)
      // Profile will be fetched by onAuthStateChange listener
      return { user: data.user, error: null }
    },
    [],
  )

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Error signing in:", error)
      return { user: null, error }
    }
    setUser(data.user)
    // Profile will be fetched by onAuthStateChange listener
    return { user: data.user, error: null }
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error signing out:", error)
      return { error }
    }
    setUser(null)
    setProfile(null)
    return { error: null }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`, // Adjust redirect URL as needed
    })
    if (error) {
      console.error("Error resetting password:", error)
      return { error }
    }
    return { error: null }
  }, [])

  const updateUserProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!user) {
        return { profile: null, error: new Error("User not authenticated.") }
      }

      const { data, error } = await supabase.from("profiles").update(updates).eq("id", user.id).select().single()

      if (error) {
        console.error("Error updating profile:", error)
        return { profile: null, error }
      }
      setProfile(data as UserProfile)
      return { profile: data as UserProfile, error: null }
    },
    [user],
  )

  const changePassword = useCallback(async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) {
      console.error("Error changing password:", error)
      return { error }
    }
    return { error: null }
  }, [])

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateUserProfile,
    changePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
