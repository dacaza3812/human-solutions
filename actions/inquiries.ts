"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

type InquiryStatus = "new" | "in_progress" | "resolved" | "archived"

export async function updateInquiryStatus(inquiryId: string, newStatus: InquiryStatus) {
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get: (name: string) => cookieStore.get(name)?.value,
      set: (name: string, value: string, options: any) => cookieStore.set(name, value, options),
      remove: (name: string) => cookieStore.delete(name), // Corrected the remove function
    },
  })

  const { data, error } = await supabase.from("inquiries").update({ status: newStatus }).eq("id", inquiryId)

  if (error) {
    console.error("Error updating inquiry status:", error)
    return { success: false, message: `Error al actualizar el estado: ${error.message}` }
  }

  return { success: true, message: "Estado de la consulta actualizado con éxito." }
}