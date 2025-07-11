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
  loading: boolean,
  subscription_status?: string // Optional, if you want to track subscription status
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
  const [subscription_status, setSubscription_status] = useState<string | null>(null)
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
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error)
        return
      }

      setProfile(data)
      console.log( "Profile fetched successfully:", data)
    } catch (error) {
      console.error("Error fetching profile:", error)
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
        metadata.referred_by = referralCode.trim()
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

      // Wait a bit for the trigger to complete
      if (data.user && !data.user.email_confirmed_at) {
        // For unconfirmed users, we might need to create the profile manually
        // This is a fallback in case the trigger doesn't work
        setTimeout(async () => {
          try {
            const { error: profileError } = await supabase.from("profiles").upsert(
              [
                {
                  id: data.user!.id,
                  email: data.user!.email,
                  first_name: userData.first_name || "",
                  last_name: userData.last_name || "",
                  phone: userData.phone || "",
                  account_type: userData.account_type || "client",
                  referred_by: referralCode && referralCode.trim() !== "" ? referralCode.trim() : null,
                },
              ],
              { onConflict: "id" },
            )

            if (profileError) {
              console.error("Error creating profile fallback:", profileError)
            }

            // Create referral relationship if applicable
            /*
            if (referralCode && referralCode.trim() !== "" && data.user) {
              const { error: referralError } = await supabase.rpc("create_referral_relationship", {
                referrer_code: referralCode.trim(),
                referred_user_id: data.user.id,
              })

              if (referralError) {
                console.error("Error creating referral relationship:", referralError)
              }
            }
              */
          } catch (err) {
            console.error("Error in profile creation fallback:", err)
          }
        }, 1000)
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
    try {
      console.log("Attempting to sign out...")
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Error during sign out:", error)
        // Optionally, you could show a toast notification to the user here
        // toast({
        //   title: "Error al cerrar sesión",
        //   description: error.message,
        //   variant: "destructive",
        // });
      } else {
        console.log("Sign out successful. Redirecting to login page.")
      }
    } catch (err) {
      console.error("Unexpected error during sign out:", err)
      // toast({
      //   title: "Error inesperado",
      //   description: "Ocurrió un error al intentar cerrar sesión.",
      //   variant: "destructive",
      // });
    } finally {
      // Always attempt to redirect to login page, even if sign out failed on Supabase side,
      // to ensure the user doesn't remain in a protected route with a potentially invalid session.
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
