import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase-server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get("session_id")

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
  }

  const supabase = createClient()

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price.product", "subscription"],
    })

    if (session.status === "complete" && session.subscription) {
      const subscription = session.subscription as Stripe.Subscription
      const userId = session.metadata?.userId
      const planId = session.metadata?.planId

      if (userId && planId) {
        const { data: existingSubscription, error: fetchError } = await supabase
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", userId)
          .single()

        if (fetchError && fetchError.code !== "PGRST116") {
          // PGRST116 means no rows found, which is fine for new subscriptions
          console.error("Error fetching existing subscription:", fetchError)
          return NextResponse.json({ error: "Database error" }, { status: 500 })
        }

        const subscriptionData = {
          user_id: userId,
          plan_id: planId,
          stripe_customer_id: subscription.customer as string,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          created_at: new Date().toISOString(),
        }

        if (existingSubscription) {
          // Update existing subscription
          const { error: updateError } = await supabase
            .from("user_subscriptions")
            .update(subscriptionData)
            .eq("user_id", userId)

          if (updateError) {
            console.error("Error updating subscription:", updateError)
            return NextResponse.json({ error: "Database update error" }, { status: 500 })
          }
        } else {
          // Insert new subscription
          const { error: insertError } = await supabase.from("user_subscriptions").insert([subscriptionData])

          if (insertError) {
            console.error("Error inserting subscription:", insertError)
            return NextResponse.json({ error: "Database insert error" }, { status: 500 })
          }
        }
      }
    }

    return NextResponse.json({ session })
  } catch (error: any) {
    console.error("Error retrieving checkout session:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
