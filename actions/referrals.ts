/* app/actions/referral-transactions.ts */
"use server"

import { createServerClient } from "@supabase/ssr"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

// Devuelve todas las transacciones de referidos para un advisor
export async function getReferralTransactions(advisorId: string) {
  // Inicializa el Supabase Client con service role y cookies
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get: (n) => cookieStore.get(n)?.value,
        set: (n, v, o) => cookieStore.set(n, v, o),
        remove: (n) => cookieStore.delete(n),
      },
    }
  )

  // Consulta a la tabla de transacciones con embedding de referee
  const { data, error } = await supabase
    .from("referral_transactions")
    .select(
      `*, referee:profiles!referral_transactions_referee_id_fkey(email, first_name, last_name)`
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching referral transactions:", error)
    return []
  }

  // Mapea para agregar campos de conveniencia
  return (data || []).map((transaction) => ({
    ...transaction,
    referee_email: transaction.referee?.email || "N/A",
    referee_name:
      (`${transaction.referee?.first_name || ""} ${transaction.referee?.last_name || ""}`.trim()) ||
      "N/A",
  }))
}

// Alterna el estado "paid" de una transacción y revalida la página financiera
export async function toggleReferralTransactionPaidStatus(
  transactionId: string,
  currentStatus: boolean
) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get: (n) => cookieStore.get(n)?.value,
        set: (n, v, o) => cookieStore.set(n, v, o),
        remove: (n) => cookieStore.delete(n),
      },
    }
  )

  const { error } = await supabase
    .from("referral_transactions")
    .update({ paid: !currentStatus })
    .eq("id", transactionId)

  if (error) {
    console.error("Error updating referral transaction paid status:", error)
    return { success: false, message: "Error al actualizar el estado de pago." }
  }

  // Revalida la página para refrescar datos en ISR
  revalidatePath("/dashboard/financial")
  return { success: true, message: "Estado de pago actualizado correctamente." }
}
