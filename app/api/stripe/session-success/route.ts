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

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.status === "complete") {
      const userId = session.metadata?.userId
      const planId = session.metadata?.planId
      const customerId = session.customer as string
      const subscriptionId = session.subscription as string

      if (!userId || !planId || !customerId || !subscriptionId) {
        console.error("Missing metadata or subscription ID in session:", session)
        return NextResponse.json({ error: "Missing required session data" }, { status: 400 })
      }

      const supabase = createClient()

      // Check if a subscription already exists for this user and Stripe subscription ID
      const { data: existingSubscription, error: fetchError } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("stripe_subscription_id", subscriptionId)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 means "no rows found"
        console.error("Error fetching existing subscription:", fetchError)
        return NextResponse.json({ error: "Database error checking subscription" }, { status: 500 })
      }

      if (existingSubscription) {
        console.warn(`Subscription ${subscriptionId} already exists for user ${userId}. Skipping insertion.`)
        return NextResponse.json({ success: true, message: "Subscription already processed." })
      }

      // Insert or update subscription information in your database
      const { error: dbError } = await supabase.from("user_subscriptions").insert({
        user_id: userId,
        plan_id: planId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        status: "active", // Or session.status if you want to map Stripe statuses
        current_period_start: new Date(session.created * 1000).toISOString(),
        current_period_end: new Date(session.expires_at! * 1000).toISOString(), // Use expires_at for one-time, current_period_end for subscription
      })

      if (dbError) {
        console.error("Error saving subscription to database:", dbError)
        return NextResponse.json({ error: "Failed to save subscription to database" }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Session not complete" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error retrieving checkout session:", error)
    return NextResponse.json({ error: "Failed to retrieve checkout session" }, { status: 500 })
  }
}
