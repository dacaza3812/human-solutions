"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function createInquiry(formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const userId = formData.get("userId") as string // Assuming userId is passed from the client

  if (!title || !description || !userId) {
    return { success: false, message: "Title, description, and user ID are required." }
  }

  const { data, error } = await supabase
    .from("inquiries")
    .insert([{ title, description, user_id: userId, status: "pending" }])
    .select()

  if (error) {
    console.error("Error creating inquiry:", error)
    return { success: false, message: error.message }
  }

  revalidatePath("/dashboard/inquiries")
  return { success: true, data }
}

export async function getInquiries() {
  const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching inquiries:", error)
    return { success: false, message: error.message, data: [] }
  }

  return { success: true, data }
}
