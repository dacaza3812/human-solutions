import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
})

export async function POST(req: NextRequest) {
  const { subscriptionId, userId } = await req.json()

  if (!subscriptionId || !userId) {
    return NextResponse.json({ error: "Missing subscriptionId or userId" }, { status: 400 })
  }

  try {
    // Cancel the subscription in Stripe
    const subscription = await stripe.subscriptions.cancel(subscriptionId)

    // Update the user's profile in Supabase to reflect no active subscription
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ subscription_status: "canceled", stripe_subscription_id: null, stripe_price_id: null })
      .eq("id", userId)

    if (updateError) {
      console.error("Error updating user profile in Supabase:", updateError)
      return NextResponse.json({ error: "Failed to update user profile in database" }, { status: 500 })
    }

    return NextResponse.json({ success: true, subscription })
  } catch (error) {
    console.error("Error canceling subscription:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
