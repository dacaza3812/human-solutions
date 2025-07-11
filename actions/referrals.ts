"use server"

import { createServerSupabaseClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function getReferralTransactions(advisorId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("referral_transactions")
    .select(`
      *,
      referee:profiles(email, first_name, last_name)
    `)
    .eq("referrer_id", advisorId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching referral transactions:", error)
    return []
  }

  return data.map((transaction) => ({
    ...transaction,
    referee_email: transaction.referee?.email || "N/A",
    referee_name: `${transaction.referee?.first_name || ""} ${transaction.referee?.last_name || ""}`.trim() || "N/A",
  }))
}

export async function toggleReferralTransactionPaidStatus(transactionId: string, currentStatus: boolean) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase
    .from("referral_transactions")
    .update({ paid: !currentStatus })
    .eq("id", transactionId)

  if (error) {
    console.error("Error updating referral transaction paid status:", error)
    return { success: false, message: "Error al actualizar el estado de pago." }
  }

  revalidatePath("/dashboard/financial") // Revalidate the financial page to show updated status
  return { success: true, message: "Estado de pago actualizado correctamente." }
}
