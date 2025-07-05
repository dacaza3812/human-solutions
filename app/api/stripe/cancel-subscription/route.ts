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

  const { subscriptionId } = await req.json()

  if (!subscriptionId) {
    return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 })
  }

  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId)

    // Optionally update your database to reflect the cancelled status
    await supabase
      .from("subscriptions")
      .update({ status: subscription.status, ends_at: new Date(subscription.current_period_end * 1000).toISOString() })
      .eq("stripe_subscription_id", subscription.id)

    return NextResponse.json({ success: true, subscription })
  } catch (error) {
    console.error("Error cancelling subscription:", error)
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 })
  }
}
