"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

// Define the UserProfile interface
export interface UserProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  account_type: "client" | "advisor" | null
  phone: string | null
  created_at: string | null
  referral_code: string | null
  stripe_customer_id: string | null
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signUp: (
    email: string,
    password: string,
    accountType: "client" | "advisor",
  ) => Promise<{ user: User | null; error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>
  signOut: () => Promise<{ error: Error | null }>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<{ profile: UserProfile | null; error: Error | null }>
  changePassword: (newPassword: string) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error fetching profile:", error)
      return null
    }
    return data as UserProfile
  }, [])

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true)
      if (session?.user) {
        setUser(session.user)
        const userProfile = await fetchUserProfile(session.user.id)
        setProfile(userProfile)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    // Initial check
    const getInitialSession = async () => {
      setLoading(true)
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        const userProfile = await fetchUserProfile(session.user.id)
        setProfile(userProfile)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    }

    getInitialSession()

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [fetchUserProfile])

  const signUp = useCallback(
    async (email: string, password: string, accountType: "client" | "advisor") => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { account_type: accountType },
        },
      })
      if (data.user) {
        setUser(data.user)
        // Fetch profile immediately after sign up to ensure it's available
        const userProfile = await fetchUserProfile(data.user.id)
        setProfile(userProfile)
      }
      return { user: data.user, error }
    },
    [fetchUserProfile],
  )

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (data.user) {
        setUser(data.user)
        const userProfile = await fetchUserProfile(data.user.id)
        setProfile(userProfile)
      }
      return { user: data.user, error }
    },
    [fetchUserProfile],
  )

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setProfile(null)
    }
    return { error }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
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

      if (data) {
        setProfile(data as UserProfile) // Update the context's profile state
        return { profile: data as UserProfile, error: null }
      }
      return { profile: null, error: new Error("No data returned after update.") }
    },
    [user],
  )

  const changePassword = useCallback(async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) {
      console.error("Error changing password:", error)
    }
    return { error }
  }, [])

  const value = React.useMemo(
    () => ({
      user,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updateUserProfile,
      changePassword,
    }),
    [user, profile, loading, signUp, signIn, signOut, resetPassword, updateUserProfile, changePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
