"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function getInquiries() {
  const supabase = createClient()
  const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching inquiries:", error)
    return []
  }
  return data
}

export async function updateInquiryStatus(inquiryId: string, newStatus: string) {
  const supabase = createClient()
  const { error } = await supabase.from("inquiries").update({ status: newStatus }).eq("id", inquiryId)

  if (error) {
    console.error("Error updating inquiry status:", error)
    return { success: false, message: "Error al actualizar el estado de la consulta." }
  }

  revalidatePath("/dashboard/inquiries")
  return { success: true, message: "Estado de la consulta actualizado con éxito." }
}
