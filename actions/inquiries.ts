"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function updateInquiryStatus(inquiryId: string, newStatus: string) {
  const supabase = createClient()

  const { error } = await supabase.from("inquiries").update({ status: newStatus }).eq("id", inquiryId)

  if (error) {
    console.error("Error updating inquiry status:", error)
    return { success: false, message: "Failed to update inquiry status." }
  }

  revalidatePath("/dashboard/inquiries")
  return { success: true, message: "Inquiry status updated successfully." }
}

export async function deleteInquiry(inquiryId: string) {
  const supabase = createClient()

  const { error } = await supabase.from("inquiries").delete().eq("id", inquiryId)

  if (error) {
    console.error("Error deleting inquiry:", error)
    return { success: false, message: "Failed to delete inquiry." }
  }

  revalidatePath("/dashboard/inquiries")
  return { success: true, message: "Inquiry deleted successfully." }
}
