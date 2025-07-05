import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase-server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
})

export async function POST(req: NextRequest) {
  const { subscriptionId } = await req.json()
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
  }

  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId)

    // Update Supabase to reflect the cancelled subscription status
    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update({ status: subscription.status, ends_at: new Date(subscription.current_period_end * 1000).toISOString() })
      .eq("user_id", user.id)
      .eq("stripe_subscription_id", subscriptionId)

    if (updateError) {
      console.error("Error updating Supabase subscription status:", updateError)
      return NextResponse.json({ error: "Failed to update subscription status in DB" }, { status: 500 })
    }

    return NextResponse.json({ success: true, subscription })
  } catch (error) {
    console.error("Error cancelling subscription:", error)
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 })
  }
}
