"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function updateInquiryStatus(
  inquiryId: string,
  newStatus: "new" | "in_progress" | "resolved" | "archived",
) {
  const supabase = createClient()

  const { error } = await supabase.from("inquiries").update({ status: newStatus }).eq("id", inquiryId)

  if (error) {
    console.error("Error updating inquiry status:", error)
    return { success: false, message: "No se pudo actualizar el estado del mensaje." }
  }

  revalidatePath("/dashboard/inquiries")
  return { success: true, message: "Estado del mensaje actualizado correctamente." }
}
