import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export interface UserProfile {
  id: string
  first_name?: string | null
  last_name?: string | null
  account_type?: string | null
  phone?: string | null
  created_at?: string | null
  referral_code?: string | null
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
}

export interface Case {
  id: string
  client_id: string
  advisor_id?: string | null
  title: string
  description: string
  status: "open" | "in_progress" | "closed" | "pending"
  created_at: string
  updated_at: string
  case_type: string
  priority: "low" | "medium" | "high"
  due_date?: string | null
}

export interface Activity {
  id: string
  user_id: string
  type: string // e.g., 'case_created', 'appointment_scheduled', 'profile_update'
  description: string
  created_at: string
}

export interface Appointment {
  id: string
  user_id: string
  title: string
  description?: string | null
  start_time: string
  end_time: string
  created_at: string
}
