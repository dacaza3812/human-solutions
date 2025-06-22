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

    // Log cookies to debug
    const cookieHeader = request.headers.get("cookie")
    console.log("Request Cookies:", cookieHeader)

    // Verificar autenticación
    const supabase = createServerComponentClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    console.log("Session in cancel-subscription API:", session)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized: No active session found." }, { status: 401 })
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
      console.error("Error updating subscription status:", updateError)
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
