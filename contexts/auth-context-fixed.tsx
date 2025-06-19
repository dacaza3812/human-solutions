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
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchUserProfile(session.user.id)
      }

      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
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
      console.log("Fetching profile for user:", userId)

      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching profile:", error)

        // If profile doesn't exist, try to create it from auth.users data
        if (error.code === "PGRST116") {
          console.log("Profile not found, attempting to create...")
          await createMissingProfile(userId)
          return
        }
        return
      }

      console.log("Profile fetched successfully:", data)
      setProfile(data)
    } catch (error) {
      console.error("Unexpected error fetching profile:", error)
    }
  }

  const createMissingProfile = async (userId: string) => {
    try {
      // Get user data from auth.users
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Generate referral code
      const firstName = user.user_metadata?.first_name || "Usuario"
      const lastName = user.user_metadata?.last_name || "Nuevo"

      // Call the database function to generate referral code
      const { data: referralCodeData, error: referralError } = await supabase.rpc("generate_referral_code", {
        first_name: firstName,
        last_name: lastName,
      })

      const referralCode =
        referralCodeData || `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}`

      // Create profile
      const { data, error } = await supabase
        .from("profiles")
        .insert([
          {
            id: userId,
            email: user.email!,
            first_name: firstName,
            last_name: lastName,
            phone: user.user_metadata?.phone || null,
            account_type: user.user_metadata?.account_type || "client",
            referral_code: referralCode,
            referred_by: user.user_metadata?.referral_code || null,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error creating profile:", error)
        return
      }

      console.log("Profile created successfully:", data)
      setProfile(data)

      // Create referral relationship if applicable
      const referredBy = user.user_metadata?.referral_code
      if (referredBy) {
        const { error: referralRelationError } = await supabase.rpc("create_referral_relationship", {
          referrer_code: referredBy,
          referred_user_id: userId,
        })

        if (referralRelationError) {
          console.error("Error creating referral relationship:", referralRelationError)
        }
      }
    } catch (error) {
      console.error("Error creating missing profile:", error)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id)
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>, referralCode?: string) => {
    try {
      // Prepare metadata
      const metadata: any = {
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        phone: userData.phone || "",
        account_type: userData.account_type || "client",
      }

      // Only add referral_code if it exists and is not empty
      if (referralCode && referralCode.trim() !== "") {
        metadata.referral_code = referralCode.trim()
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: "https://foxlawyer.vercel.app/dashboard",
          data: metadata,
        },
      })

      if (error) {
        console.error("Signup error:", error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error("Unexpected signup error:", error)
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
    await supabase.auth.signOut()
    router.push("/")
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://foxlawyer.vercel.app/reset-password",
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
