// app/actions/sendPaymentEmail.ts
"use server"

import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { Resend } from "resend"
import PaymentSuccessEmail from "@/components/emails/PaymentSuccessEmail"
import React from "react"

export async function sendPaymentSuccessEmail(userEmail: string, firstName: string, planName: string) {
  const resend = new Resend("re_awk63cGM_EVL3sSNWJBbpU2Xstk9MZhaC")

  await resend.emails.send({
    from: "Fox Lawyer <no-reply@foxlawyer.net>",
    to: userEmail,
    subject: "Pago procesado correctamente ✔️",
    react: React.createElement(PaymentSuccessEmail, { firstName, planName }),
  })
}
