import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY // Esta es solo para el lado del servidor

// Cliente Supabase para el lado del cliente
if (!supabaseUrl) {
  throw new Error(
    "Falta la variable de entorno: NEXT_PUBLIC_SUPABASE_URL. Por favor, configúrala en los ajustes de tu proyecto Vercel.",
  )
}
if (!supabaseAnonKey) {
  throw new Error(
    "Falta la variable de entorno: NEXT_PUBLIC_SUPABASE_ANON_KEY. Por favor, configúrala en los ajustes de tu proyecto Vercel.",
  )
}

console.log(
  "Initializing client-side Supabase client with URL:",
  supabaseUrl,
  "and Anon Key:",
  supabaseAnonKey ? "******" : "MISSING",
)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente Supabase Admin para el lado del servidor
// Este cliente SOLO debe usarse en componentes de servidor, rutas API o server actions.
if (!supabaseServiceKey) {
  throw new Error(
    "Falta la variable de entorno: SUPABASE_SERVICE_ROLE_KEY. Las operaciones de Supabase en el lado del servidor (por ejemplo, en rutas API o server actions) fallarán. Por favor, configúrala en los ajustes de tu proyecto Vercel.",
  )
}

console.log("Initializing server-side Supabase Admin client with URL:", supabaseUrl, "and Service Role Key: ******")
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Tipos para nuestras tablas de base de datos
export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  account_type: "client" | "advisor"
  stripe_customer_id?: string
  subscription_status?: string
  subscription_id?: string
  referred_by?: string
  referral_code?: string
  created_at: string
  updated_at: string
  plan_id?: number
  subscription_start_date?: string
  subscription_end_date?: string
  subscription_cancelled_at?: string
}

export interface Plan {
  id: number
  name: string
  description: string
  price: number
  currency: string
  billing_interval: "month" | "year"
  stripe_price_id?: string
  features: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: number
  stripe_subscription_id: string
  status: string
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  user_id: string
  plan_id: number
  stripe_payment_intent_id?: string
  stripe_invoice_id?: string
  stripe_checkout_session_id?: string
  amount: number
  currency: string
  status: "pending" | "succeeded" | "failed" | "cancelled"
  payment_method?: string
  created_at: string
  updated_at: string
}

export interface ReferralStats {
  total_referrals: number
  active_referrals: number
  total_earnings: number
  monthly_earnings: number
}

// Funciones de servicio para operaciones del lado del servidor
export const supabaseService = {
  async getProfile(userId: string) {
    try {
      console.log("Getting profile for user:", userId)
      const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("id", userId).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error getting profile:", error)
        return { data: null, error }
      }

      console.log("Profile retrieved:", data ? "found" : "not found")
      return { data, error: null }
    } catch (err) {
      console.error("Unexpected error getting profile:", err)
      return { data: null, error: err }
    }
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      console.log("Updating profile for user:", userId, updates)
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", userId)
        .select()
        .single()

      if (error) {
        console.error("Error updating profile:", error)
        return { data: null, error }
      }

      console.log("Profile updated successfully")
      return { data, error: null }
    } catch (err) {
      console.error("Unexpected error updating profile:", err)
      return { data: null, error: err }
    }
  },

  async getAllPlans(): Promise<{ data: Plan[] | null; error: any }> {
    try {
      const { data, error } = await supabaseAdmin
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true })

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async getPlanById(planId: number) {
    try {
      console.log("Getting plan:", planId)

      // Mock plan data - replace with actual database query
      const mockPlans: Plan[] = [
        {
          id: 1,
          name: "Standard",
          description: "Ideal para necesidades básicas de asesoría.",
          price: 49.99,
          currency: "USD",
          billing_interval: "month",
          stripe_price_id: "price_1Pj1234567890abcdef", // Replace with actual Stripe Price ID
          features: ["3 consultas/mes", "Soporte por email", "Acceso a recursos básicos"],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: "Premium",
          description: "Para un soporte más completo y personalizado.",
          price: 149.99,
          currency: "USD",
          billing_interval: "month",
          stripe_price_id: "price_1Pj1234567890abcdef", // Replace with actual Stripe Price ID
          features: ["10 consultas/mes", "Soporte prioritario", "Acceso a todos los recursos"],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 3,
          name: "Collaborative",
          description: "Solución integral para equipos o familias.",
          price: 299.99,
          currency: "USD",
          billing_interval: "month",
          stripe_price_id: "price_1Pj1234567890abcdef", // Replace with actual Stripe Price ID
          features: ["Consultas ilimitadas", "Asesor dedicado 24/7", "Acceso para equipos"],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      const plan = mockPlans.find((p) => p.id === planId)

      if (!plan) {
        return { data: null, error: { message: "Plan not found" } }
      }

      console.log("Plan found:", plan.name)
      return { data: plan, error: null }
    } catch (err) {
      console.error("Unexpected error getting plan:", err)
      return { data: null, error: err }
    }
  },

  async getPlanByName(name: string): Promise<{ data: Plan | null; error: any }> {
    try {
      const { data, error } = await supabaseAdmin.from("plans").select("*").eq("name", name).single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async createPayment(
    payment: Omit<Payment, "id" | "created_at" | "updated_at">,
  ): Promise<{ data: Payment | null; error: any }> {
    try {
      const { data, error } = await supabaseAdmin
        .from("payments")
        .insert({
          ...payment,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async getPaymentsByUser(userId: string): Promise<{ data: Payment[] | null; error: any }> {
    try {
      console.log("Fetching payment history for user:", userId)
      const { data, error } = await supabaseAdmin
        .from("payments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching payment history:", error)
        return { data: null, error }
      }

      console.log("Payment history retrieved:", data ? `${data.length} payments` : "no payments")
      return { data, error: null }
    } catch (error) {
      console.error("Unexpected error fetching payment history:", error)
      return { data: null, error }
    }
  },

  async getSubscriptionInfo(userId: string): Promise<{ data: any | null; error: any }> {
    try {
      console.log("Fetching subscription info for user:", userId)
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select(
          `
          subscription_status,
          subscription_start_date,
          subscription_end_date,
          plan_id,
          plans (
            id,
            name,
            price,
            description,
            features,
            currency,
            billing_interval
          )
        `,
        )
        .eq("id", userId)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching subscription info:", error)
        return { data: null, error }
      }

      console.log("Subscription info retrieved:", data ? "found" : "not found")
      return { data, error: null }
    } catch (error) {
      console.error("Unexpected error fetching subscription info:", error)
      return { data: null, error }
    }
  },

  async updateSubscription(
    userId: string,
    subscriptionData: {
      plan_id?: number
      subscription_status?: string
      stripe_subscription_id?: string
      subscription_start_date?: string
      subscription_end_date?: string
      subscription_cancelled_at?: string
    },
  ): Promise<{ data: UserProfile | null; error: any }> {
    try {
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .update({
          ...subscriptionData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async getReferralStats(referralCode: string): Promise<{ data: ReferralStats | null; error: any }> {
    try {
      const { data, error } = await supabaseAdmin.rpc("get_referral_stats", {
        user_referral_code: referralCode,
      })

      if (error) {
        return { data: null, error }
      }

      if (data && data.length > 0) {
        return { data: data[0], error: null }
      }

      return {
        data: {
          total_referrals: 0,
          active_referrals: 0,
          total_earnings: 0,
          monthly_earnings: 0,
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  },
}

export default supabase
