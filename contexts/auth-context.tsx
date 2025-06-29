"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string
  first_name?: string | null
  last_name?: string | null
  account_type?: string | null
  phone?: string | null
  created_at?: string | null
  referral_code?: string | null
  stripe_customer_id?: string | null
  subscription_status?: string | null
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>
  changePassword: (newPassword: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching user profile:", error)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error("Unexpected error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) return { error }

    if (data.user) {
      // Create user profile
      const { error: profileError } = await supabase.from("user_profiles").insert([
        {
          id: data.user.id,
          first_name: userData.firstName,
          last_name: userData.lastName,
          account_type: userData.accountType,
          phone: userData.phone,
          referral_code: userData.referralCode,
        },
      ])

      if (profileError) {
        console.error("Error creating user profile:", profileError)
        return { error: profileError }
      }
    }

    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push("/")
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error("No user logged in") }

    const { error } = await supabase.from("user_profiles").update(updates).eq("id", user.id)

    if (!error) {
      setProfile((prev) => (prev ? { ...prev, ...updates } : null))
    }

    return { error }
  }

  const changePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { error }
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
    changePassword,
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
