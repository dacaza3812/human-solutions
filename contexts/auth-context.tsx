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
  const getInitialSession = async () => {
    try {
      setLoading(true); // Activa el estado de carga
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentPath = window.location.pathname;
      const publicRoutes = ["/", "/login", "/register", "/reset-password"];

      if (!session || !session.user) {
        if (!publicRoutes.includes(currentPath)) {
          setUser(null);
          setProfile(null);
          router.push("/login");
        }
      } else {
        setSession(session);
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    } finally {
      setLoading(false); // Asegúrate de desactivar el estado de carga
    }
  };

  getInitialSession();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    try {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Error handling auth state change:", error);
    } finally {
      setLoading(false); // Asegúrate de desactivar el estado de carga
    }
  });

  return () => subscription.unsubscribe();
}, []);

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
          emailRedirectTo: "https://foxlawyer.net/dashboard",
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
    console.log("Attempting to sign out...");
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error during sign out:", error);
    }

    // Borra todas las cookies del sitio
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    });

    // Redirige al login
    router.push("/login");
  } catch (err) {
    console.error("Unexpected error during sign out:", err);
  } finally {
    setUser(null);
    setProfile(null);
    setSession(null);
    setLoading(false);
  }
};

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
