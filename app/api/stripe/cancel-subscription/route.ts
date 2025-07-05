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

    // Optionally, update your database to reflect the cancelled subscription status
    await supabase
      .from("user_subscriptions")
      .update({ status: subscription.status, ends_at: new Date(subscription.current_period_end * 1000).toISOString() })
      .eq("user_id", user.id)
      .eq("stripe_subscription_id", subscription.id)

    return NextResponse.json({ success: true, subscription })
  } catch (error: any) {
    console.error("Error cancelling subscription:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
