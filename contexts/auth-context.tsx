"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { User, UserProfile, Session } from "@/types"

const AuthContext = createContext<
  | {
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
      updateUserProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>
      changePassword: (newPassword: string) => Promise<{ error: any }>
      refreshProfile: () => Promise<void>
    }
  | undefined
>(undefined)

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
      console.log("Auth state change:", event, session?.user?.id)
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

  const fetchUserProfile = async (userId: string, retries = 3) => {
    try {
      console.log("Fetching profile for user:", userId)
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error)

        // If profile not found and we have retries left, wait and try again
        if (error.code === "PGRST116" && retries > 0) {
          console.log(`Profile not found, retrying in 1 second... (${retries} retries left)`)
          setTimeout(() => fetchUserProfile(userId, retries - 1), 1000)
          return
        }
        return
      }

      console.log("Profile fetched successfully:", data)
      setProfile(data)
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id)
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>, referralCode?: string) => {
    try {
      console.log("Starting signup process for:", email)

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

      console.log("Signup successful:", data.user?.id)

      // If user is immediately confirmed, create profile manually
      if (data.user && data.user.email_confirmed_at) {
        console.log("User confirmed immediately, creating profile...")
        await createUserProfile(data.user, userData, referralCode)
      } else if (data.user) {
        // For unconfirmed users, create profile after a delay
        console.log("User not confirmed, creating profile with delay...")
        setTimeout(async () => {
          await createUserProfile(data.user!, userData, referralCode)
        }, 2000)
      }

      return { error: null }
    } catch (error) {
      console.error("Unexpected signup error:", error)
      return { error }
    }
  }

  const createUserProfile = async (user: User, userData: Partial<UserProfile>, referralCode?: string) => {
    try {
      console.log("Creating profile for user:", user.id)

      const profileData = {
        id: user.id,
        email: user.email!,
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        phone: userData.phone || "",
        account_type: userData.account_type || "client",
        referred_by: referralCode && referralCode.trim() !== "" ? referralCode.trim() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error: profileError } = await supabase.from("profiles").upsert([profileData], { onConflict: "id" })

      if (profileError) {
        console.error("Error creating profile:", profileError)
        return
      }

      console.log("Profile created successfully")

      // Create referral relationship if applicable
      if (referralCode && referralCode.trim() !== "") {
        console.log("Creating referral relationship...")
        const { error: referralError } = await supabase.rpc("create_referral_relationship", {
          referrer_code: referralCode.trim(),
          referred_user_id: user.id,
        })

        if (referralError) {
          console.error("Error creating referral relationship:", referralError)
        } else {
          console.log("Referral relationship created successfully")
        }
      }

      // Refresh profile data
      await fetchUserProfile(user.id)
    } catch (err) {
      console.error("Error in profile creation:", err)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in user:", email)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!error) {
        console.log("Sign in successful")
        // Verificar si hay un plan seleccionado guardado
        const selectedPlanId = localStorage.getItem("selectedPlanId")
        if (selectedPlanId) {
          localStorage.removeItem("selectedPlanId")
          router.push(`/dashboard?planId=${selectedPlanId}`)
        } else {
          router.push("/dashboard")
        }
      }

      return { error }
    } catch (error) {
      console.error("Sign in error:", error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      console.log("Attempting to sign out...")
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Error during sign out:", error)
      } else {
        console.log("Sign out successful. Redirecting to login page.")
      }
    } catch (err) {
      console.error("Unexpected error during sign out:", err)
    } finally {
      router.push("/login")
    }
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

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: { message: "No user logged in." } }
    }
    try {
      console.log("Attempting to update user profile:", updates)
      const { data, error } = await supabase.from("profiles").update(updates).eq("id", user.id).select().single()

      if (error) {
        console.error("Error updating profile:", error)
        return { error }
      }

      setProfile(data) // Update local profile state
      console.log("Profile updated successfully:", data)
      return { error: null }
    } catch (error) {
      console.error("Unexpected error updating profile:", error)
      return { error }
    }
  }

  const changePassword = async (newPassword: string) => {
    if (!user) {
      return { error: { message: "No user logged in." } }
    }
    try {
      console.log("Attempting to change password...")
      const { data, error } = await supabase.auth.updateUser({ password: newPassword })

      if (error) {
        console.error("Error changing password:", error)
        return { error }
      }

      console.log("Password changed successfully:", data)
      return { error: null }
    } catch (error) {
      console.error("Unexpected error changing password:", error)
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
