import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface UserProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  account_type?: "client" | "advisor"
  referral_code?: string
  referred_by?: string
  stripe_customer_id?: string
  plan_id?: number
  subscription_status?: "active" | "inactive" | "past_due" | "cancelled"
  subscription_start_date?: string
  subscription_end_date?: string
  subscription_cancelled_at?: string
  created_at: string
  updated_at: string
}

export interface Plan {
  id: number
  name: string
  description?: string
  price: number
  currency: string
  billing_interval: "month" | "year"
  features?: string[]
  stripe_price_id?: string
  is_active: boolean
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

// Database helper functions
export class SupabaseService {
  private client = supabase

  // Profile operations
  async getProfile(userId: string): Promise<{ data: UserProfile | null; error: any }> {
    try {
      const { data, error } = await this.client.from("profiles").select("*").eq("id", userId).single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  async updateProfile(
    userId: string,
    updates: Partial<UserProfile>,
  ): Promise<{ data: UserProfile | null; error: any }> {
    try {
      const { data, error } = await this.client
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", userId)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Plan operations
  async getAllPlans(): Promise<{ data: Plan[] | null; error: any }> {
    try {
      const { data, error } = await this.client
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true })

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  async getPlanById(planId: number): Promise<{ data: Plan | null; error: any }> {
    try {
      const { data, error } = await this.client.from("plans").select("*").eq("id", planId).single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  async getPlanByName(name: string): Promise<{ data: Plan | null; error: any }> {
    try {
      const { data, error } = await this.client.from("plans").select("*").eq("name", name).single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Payment operations
  async createPayment(
    payment: Omit<Payment, "id" | "created_at" | "updated_at">,
  ): Promise<{ data: Payment | null; error: any }> {
    try {
      const { data, error } = await this.client
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
  }

  async getPaymentsByUser(userId: string): Promise<{ data: Payment[] | null; error: any }> {
    try {
      const { data, error } = await this.client
        .from("payments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Subscription operations
  async getSubscriptionInfo(userId: string): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await this.client
        .from("profiles")
        .select(`
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
        `)
        .eq("id", userId)
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

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
      const { data, error } = await this.client
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
  }

  // Referral operations
  async getReferralStats(referralCode: string): Promise<{ data: ReferralStats | null; error: any }> {
    try {
      const { data, error } = await this.client.rpc("get_referral_stats", {
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
  }
}

// Export a singleton instance
export const supabaseService = new SupabaseService()
