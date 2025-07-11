"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function getReferralTransactions(advisorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("referral_transactions")
    .select(
      `
      *,
      payments (amount, created_at),
      referee:profiles!referral_transactions_referee_id_fkey (first_name, last_name, email)
    `,
    )
    .eq("referrer_id", advisorId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching referral transactions:", error)
    return []
  }

  return data.map((transaction) => ({
    ...transaction,
    referee_name: `${transaction.referee?.first_name || ""} ${transaction.referee?.last_name || ""}`.trim(),
    referee_email: transaction.referee?.email || "",
    payment_amount: transaction.payments?.amount || 0,
    payment_date: transaction.payments?.created_at || "",
  }))
}

export async function toggleReferralTransactionPaidStatus(transactionId: string, currentStatus: boolean) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("referral_transactions")
    .update({ paid: !currentStatus })
    .eq("id", transactionId)
    .select()

  if (error) {
    console.error("Error updating referral transaction paid status:", error)
    return { success: false, message: "Error al actualizar el estado de pago." }
  }

  revalidatePath("/dashboard/financial")
  return { success: true, message: "Estado de pago actualizado correctamente." }
}

export type ReferralTransactionWithDetails = Awaited<ReturnType<typeof getReferralTransactions>>[number]
