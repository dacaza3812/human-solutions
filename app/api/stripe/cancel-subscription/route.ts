import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies: cookies() })

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      console.error("Error getting session for cancellation:", sessionError?.message || "No session found")
      return NextResponse.json({ error: "Unauthorized: No active session found." }, { status: 401 })
    }

    const { subscriptionId } = await request.json()

    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID is required." }, { status: 400 })
    }

    const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId)

    // Update Supabase profile status
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ subscription_status: canceledSubscription.status, plan_id: null })
      .eq("id", session.user.id)

    if (updateError) {
      console.error("Error updating Supabase profile after cancellation:", updateError)
      // Even if Supabase update fails, Stripe cancellation was successful, so we still return success to client
      return NextResponse.json(
        {
          subscription: canceledSubscription,
          warning: "Subscription canceled in Stripe, but failed to update status in Supabase.",
        },
        { status: 200 },
      )
    }

    return NextResponse.json({ subscription: canceledSubscription })
  } catch (error: any) {
    console.error("Error canceling subscription:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
