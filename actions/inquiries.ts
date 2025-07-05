"use server"

import { createClient } from "@/lib/supabase-server"

export async function getInquiries(offset: number, limit: number, fromDate?: string, toDate?: string) {
  const supabase = createClient()

  let query = supabase.from("inquiries").select("*", { count: "exact" }).order("created_at", { ascending: false })

  if (fromDate) {
    query = query.gte("created_at", fromDate)
  }
  if (toDate) {
    query = query.lte("created_at", toDate)
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1)

  if (error) {
    console.error("Error fetching inquiries:", error)
    return { data: null, count: 0, error: error.message }
  }

  return { data, count, error: null }
}
