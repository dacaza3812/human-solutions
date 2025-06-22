// app/api/stripe/cancel-subscription/route.ts
import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies, headers } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId } = await request.json()
    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 })
    }

    // Logs para depuración
    const allCookies = cookies().getAll().map(c => c.name)
    console.log("Cookies recibidas:", allCookies)

    // Cliente supabase para Route Handlers
    const supabase = createRouteHandlerClient({
      cookies,
      headers,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    })

    // Obtener sesión
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    console.log("Sesión:", session?.user?.id, "Error:", sessionError?.message)
    if (sessionError) {
      return NextResponse.json({ error: `Auth error: ${sessionError.message}` }, { status: 401 })
    }
    if (!session) {
      return NextResponse.json({ error: "No active session. Please log in again." }, { status: 401 })
    }

    // Verificar que el usuario sea dueño de esa suscripción
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_subscription_id")
      .eq("id", session.user.id)
      .single()

    if (profileError || profile?.stripe_subscription_id !== subscriptionId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Cancelar en Stripe
    const canceled = await stripe.subscriptions.cancel(subscriptionId)

    // Actualizar estado en Supabase
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        subscription_status: "canceled",
        subscription_cancelled_at: new Date().toISOString(),
      })
      .eq("id", session.user.id)

    if (updateError) {
      console.warn("Cancelado en Stripe, pero fallo update:", updateError)
      return NextResponse.json({
        success: true,
        subscription: canceled,
        warning: "Canceled in Stripe but failed to update local status",
      })
    }

    return NextResponse.json({ success: true, subscription: canceled })
  } catch (err: any) {
    console.error("Error inesperado:", err)
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: err.statusCode || 500 },
    )
  }
}
