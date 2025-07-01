"use client"

import React, { createContext, useState, useEffect, useContext, useCallback } from "react"
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
  stripe_subscription_id?: string | null
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<{ data: UserProfile | null; error: Error | null }>
  changePassword: (newPassword: string) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const isMounted = React.useRef(false)

  useEffect(() => {
    isMounted.current = true

    const getSessionAndProfile = async () => {
      setLoading(true)
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Error getting session:", sessionError)
          if (isMounted.current) {
            setUser(null)
            setProfile(null)
          }
          return
        }

        if (session?.user) {
          if (isMounted.current) {
            setUser(session.user)
          }
          await fetchProfile(session.user.id)
        } else {
          if (isMounted.current) {
            setUser(null)
            setProfile(null)
          }
        }
      } catch (error) {
        console.error("Unexpected error in getSessionAndProfile:", error)
        if (isMounted.current) {
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (isMounted.current) {
          setLoading(false)
        }
      }
    }

    getSessionAndProfile()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session)
      if (isMounted.current) {
        setLoading(true) // Set loading true on any auth state change
      }
      if (session?.user) {
        if (isMounted.current) {
          setUser(session.user)
        }
        await fetchProfile(session.user.id)
      } else {
        if (isMounted.current) {
          setUser(null)
          setProfile(null)
        }
      }
      if (isMounted.current) {
        setLoading(false) // Set loading false after processing auth state change
      }
    })

    return () => {
      isMounted.current = false
      authListener.unsubscribe()
    }
  }, [])

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
      if (error) {
        console.error("Error fetching profile:", error)
        if (isMounted.current) {
          setProfile(null)
        }
      } else {
        if (isMounted.current) {
          setProfile(data)
        }
      }
    } catch (error) {
      console.error("Unexpected error in fetchProfile:", error)
      if (isMounted.current) {
        setProfile(null)
      }
    }
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Error signing out:", error)
        throw error
      }
      if (isMounted.current) {
        setUser(null)
        setProfile(null)
      }
      router.push("/login")
    } catch (error: any) {
      console.error("Unexpected error during sign out:", error)
      // Optionally, show a toast or message to the user
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }, [router])

  const updateUserProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!user) return { data: null, error: new Error("User not authenticated.") }

      try {
        const { data, error } = await supabase.from("profiles").update(updates).eq("id", user.id).select().single()

        if (error) {
          console.error("Error updating profile:", error)
          return { data: null, error }
        }

        if (isMounted.current) {
          setProfile((prev) => (prev ? { ...prev, ...data } : data))
        }
        return { data, error: null }
      } catch (error: any) {
        console.error("Unexpected error during profile update:", error)
        return { data: null, error: new Error(error.message || "An unexpected error occurred.") }
      }
    },
    [user],
  )

  const changePassword = useCallback(
    async (newPassword: string) => {
      if (!user) return { error: new Error("User not authenticated.") }

      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) {
          console.error("Error changing password:", error)
          return { error }
        }
        return { error: null }
      } catch (error: any) {
        console.error("Unexpected error during password change:", error)
        return { error: new Error(error.message || "An unexpected error occurred.") }
      }
    },
    [user],
  )

  const value = React.useMemo(
    () => ({
      user,
      profile,
      loading,
      signOut,
      updateUserProfile,
      changePassword,
    }),
    [user, profile, loading, signOut, updateUserProfile, changePassword],
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
