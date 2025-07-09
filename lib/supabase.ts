import { Database } from "@/database.types"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Types for our user data
export interface UserProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  account_type?: "client" | "advisor"
  referral_code?: string
  referred_by?: string
  created_at: string
  updated_at: string
  subscription_status: "active" | "inactive" | "cancelled" | null
}

export interface ReferralStats {
  total_referrals: number
  active_referrals: number
  total_earnings: number
  monthly_earnings: number
}
