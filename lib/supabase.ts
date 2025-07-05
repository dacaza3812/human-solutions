import { createClient } from "@supabase/supabase-js"

// Log the environment variables to help debug if they are undefined
console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export type UserProfile = {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  account_type: "client" | "advisor"
  referred_by: string | null
  referral_code: string | null
  created_at: string
}
