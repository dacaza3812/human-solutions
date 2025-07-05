import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase-server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
})

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id")

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
  }

  const supabase = createClient()

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.status === "complete") {
      const userId = session.metadata?.userId
      const planId = session.metadata?.planId
      const stripeCustomerId = session.customer as string
      const stripeSubscriptionId = session.subscription as string

      if (!userId || !planId || !stripeCustomerId || !stripeSubscriptionId) {
        console.error("Missing metadata or subscription ID in session:", session)
        return NextResponse.json({ error: "Missing data in session" }, { status: 400 })
      }

      // Update user's profile with Stripe customer ID
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", userId)

      if (profileError) {
        console.error("Error updating profile with Stripe customer ID:", profileError)
        return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
      }

      // Insert or update subscription details
      const { error: subscriptionError } = await supabase.from("user_subscriptions").upsert(
        {
          user_id: userId,
          plan_id: Number.parseInt(planId),
          stripe_subscription_id: stripeSubscriptionId,
          status: "active", // Or session.status if Stripe provides a more granular status
          current_period_start: new Date(session.current_period_start * 1000).toISOString(),
          current_period_end: new Date(session.current_period_end * 1000).toISOString(),
        },
        { onConflict: "user_id" }, // Update if user_id already exists
      )

      if (subscriptionError) {
        console.error("Error upserting subscription:", subscriptionError)
        return NextResponse.json({ error: "Failed to save subscription details" }, { status: 500 })
      }

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions?success=true`)
    } else {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions?success=false`)
    }
  } catch (error) {
    console.error("Error retrieving checkout session:", error)
    return NextResponse.json({ error: "Failed to retrieve checkout session" }, { status: 500 })
  }
}
