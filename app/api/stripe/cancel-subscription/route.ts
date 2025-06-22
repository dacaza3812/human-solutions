import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId } = await request.json()

    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 })
    }

    // Log all cookies available on the server-side
    const cookieStore = cookies()
    console.log("Server-side cookies available:", cookieStore.getAll())

    // IMPORTANT: Verify SUPABASE_JWT_SECRET is loaded
    const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET
    if (!supabaseJwtSecret) {
      console.error("SUPABASE_JWT_SECRET is not set in environment variables!")
      return NextResponse.json(
        { error: "Server configuration error: SUPABASE_JWT_SECRET is missing." },
        { status: 500 },
      )
    }
    console.log("SUPABASE_JWT_SECRET is set (first 5 chars):", supabaseJwtSecret.substring(0, 5) + "...")

    // Verificar autenticación
    const supabase = createServerComponentClient({
      cookies,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    })
    const {
      data: { session },
      error: sessionError, // Capture potential error from getSession
    } = await supabase.auth.getSession()

    console.log("Session in cancel-subscription API:", session)
    if (sessionError) {
      console.error("Error getting session from Supabase:", sessionError)
    }

    if (!session) {
      return NextResponse.json(
        {
          error:
            "Unauthorized: No active session found. Please ensure you are logged in and cookies are being sent correctly.",
        },
        { status: 401 },
      )
    }

    // Cancelar la suscripción en Stripe
    const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId)

    // Actualizar el estado en Supabase
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        subscription_status: "canceled",
        subscription_cancelled_at: new Date().toISOString(),
      })
      .eq("id", session.user.id)

    if (updateError) {
      console.error("Error updating subscription status in Supabase:", updateError)
      return NextResponse.json(
        { error: `Failed to update subscription status in Supabase: ${updateError.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      subscription: canceledSubscription,
    })
  } catch (error: any) {
    console.error("Error canceling subscription:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
