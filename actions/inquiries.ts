"use server"

import { createClient } from "@/lib/supabase-server"

export async function getInquiries() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching inquiries:", error)
    return { inquiries: null, error: error.message }
  }

  return { inquiries: data, error: null }
}
