import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

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
}

export interface ReferralStats {
  total_referrals: number
  active_referrals: number
  total_earnings: number
  monthly_earnings: number
}

export const supabase = createClientComponentClient()
