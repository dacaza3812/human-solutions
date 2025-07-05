import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase-server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
})

const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const buf = await req.text()
  const sig = req.headers.get("stripe-signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const supabase = createClient()

  switch (event.type) {
    case "checkout.session.completed":
      const checkoutSession = event.data.object as Stripe.Checkout.Session
      const userId = checkoutSession.metadata?.userId
      const planId = checkoutSession.metadata?.planId
      const customerId = checkoutSession.customer as string
      const subscriptionId = checkoutSession.subscription as string

      if (!userId || !planId || !customerId || !subscriptionId) {
        console.error("Missing metadata or subscription ID in checkout.session.completed event:", checkoutSession)
        return NextResponse.json({ error: "Missing required data" }, { status: 400 })
      }

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
        return NextResponse.json({ received: true })
      }

      const { error: insertError } = await supabase.from("user_subscriptions").insert({
        user_id: userId,
        plan_id: planId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        status: "active",
        current_period_start: new Date(checkoutSession.created * 1000).toISOString(),
        current_period_end: new Date(checkoutSession.expires_at! * 1000).toISOString(),
      })

      if (insertError) {
        console.error("Error inserting subscription:", insertError)
        return NextResponse.json({ error: "Failed to insert subscription" }, { status: 500 })
      }
      break

    case "customer.subscription.updated":
      const subscription = event.data.object as Stripe.Subscription
      const { error: updateError } = await supabase
        .from("user_subscriptions")
        .update({
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
          ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
        })
        .eq("stripe_subscription_id", subscription.id)

      if (updateError) {
        console.error("Error updating subscription:", updateError)
        return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
      }
      break

    case "customer.subscription.deleted":
      const deletedSubscription = event.data.object as Stripe.Subscription
      const { error: deleteError } = await supabase
        .from("user_subscriptions")
        .update({ status: deletedSubscription.status, ended_at: new Date().toISOString() })
        .eq("stripe_subscription_id", deletedSubscription.id)

      if (deleteError) {
        console.error("Error deleting subscription:", deleteError)
        return NextResponse.json({ error: "Failed to delete subscription" }, { status: 500 })
      }
      break

    default:
      console.warn(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
