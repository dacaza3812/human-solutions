import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase-server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
})

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Fetch the user's current subscription from your database
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .select("stripe_subscription_id")
      .eq("user_id", user.id)
      .single()

    if (subscriptionError || !subscriptionData) {
      console.error("Error fetching subscription:", subscriptionError)
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    const subscriptionId = subscriptionData.stripe_subscription_id

    // Cancel the subscription in Stripe
    const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId)

    // Update your database to reflect the canceled subscription
    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update({
        status: canceledSubscription.status,
        ends_at: new Date(canceledSubscription.current_period_end * 1000).toISOString(),
      })
      .eq("user_id", user.id)

    if (updateError) {
      console.error("Error updating subscription in DB:", updateError)
      return NextResponse.json({ error: "Failed to update subscription status" }, { status: 500 })
    }

    return NextResponse.json({ success: true, subscription: canceledSubscription })
  } catch (error) {
    console.error("Error canceling subscription:", error)
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 })
  }
}
