import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
})

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId } = await request.json()

    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 })
    }

    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "No authorization header" }, { status: 401 })
    }

    // Verificar autenticación
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const token = authHeader.replace("Bearer ", "")
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

     if (userError || !user) {
      return NextResponse.json({ error: "Invalid user" }, { status: 401 })
    }

    // Cancelar la suscripción en Stripe
    const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId)

    // Actualizar el estado en Supabase
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        subscription_status: "cancelled",
        subscription_cancelled_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error updating subscription status:", updateError)
      return NextResponse.json(
        { error: `Failed to update subscription status: ${updateError.message}` },
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
