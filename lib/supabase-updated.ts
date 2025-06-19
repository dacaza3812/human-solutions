import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types actualizados para nuestros datos de usuario
export interface UserProfile {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  phone?: string | null // Campo de teléfono opcional
  account_type?: "client" | "advisor"
  referral_code?: string
  referred_by?: string | null // Campo opcional para referidos
  is_active?: boolean
  created_at: string
  updated_at: string
}

export interface ReferralStats {
  total_referrals: number
  active_referrals: number
  total_earnings: number
  monthly_earnings: number
}

export interface ReferralRecord {
  referred_user_id: string
  referred_email: string
  referred_first_name?: string | null
  referred_last_name?: string | null
  referred_phone?: string | null
  referral_date: string
  commission_earned: number
  commission_paid: boolean
  status: string
}

// Función helper para obtener estadísticas de referidos
export async function getReferralStats(userId: string): Promise<ReferralStats | null> {
  try {
    const { data, error } = await supabase.rpc("get_referral_stats_by_id", {
      user_profile_id: userId,
    })

    if (error) {
      console.error("[SUPABASE] Error getting referral stats:", error)
      return null
    }

    return data[0] || { total_referrals: 0, active_referrals: 0, total_earnings: 0, monthly_earnings: 0 }
  } catch (error) {
    console.error("[SUPABASE] Unexpected error getting referral stats:", error)
    return null
  }
}

// Función helper para obtener lista de referidos
export async function getUserReferrals(userId: string): Promise<ReferralRecord[]> {
  try {
    const { data, error } = await supabase.rpc("get_user_referrals", {
      user_profile_id: userId,
    })

    if (error) {
      console.error("[SUPABASE] Error getting user referrals:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("[SUPABASE] Unexpected error getting user referrals:", error)
    return []
  }
}
