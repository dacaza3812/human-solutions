"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function handleStatusChange(inquiryId: string, newStatus: string) {
  const { data, error } = await supabase.from("inquiries").update({ status: newStatus }).eq("id", inquiryId).select()

  if (error) {
    console.error("Error updating inquiry status:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/inquiries")
  return { success: true, data }
}
