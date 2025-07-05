import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase-server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const sig = req.headers.get("stripe-signature")
  const body = await req.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const checkoutSession = event.data.object as Stripe.Checkout.Session
      const userId = checkoutSession.metadata?.userId
      const planId = checkoutSession.metadata?.planId
      const stripeCustomerId = checkoutSession.customer as string
      const stripeSubscriptionId = checkoutSession.subscription as string

      if (!userId || !planId || !stripeCustomerId || !stripeSubscriptionId) {
        console.error("Missing metadata or subscription ID in checkout.session.completed event:", checkoutSession)
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
          status: "active",
          current_period_start: new Date(checkoutSession.created * 1000).toISOString(), // Use session creation time
          current_period_end: new Date(checkoutSession.expires_at * 1000).toISOString(), // Use session expiry time
        },
        { onConflict: "user_id" },
      )

      if (subscriptionError) {
        console.error("Error upserting subscription:", subscriptionError)
        return NextResponse.json({ error: "Failed to save subscription details" }, { status: 500 })
      }
      break

    case "invoice.payment_succeeded":
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      try {
        // Get user by Stripe customer ID
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("stripe_customer_id", customerId)
          .single()

        if (profileError || !profile) {
          console.error("User not found for customer:", customerId)
          return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Create payment record for recurring payment
        const { error: paymentError } = await supabase.from("payments").insert({
          user_id: profile.id,
          plan_id: profile.plan_id,
          stripe_invoice_id: invoice.id,
          amount: (invoice.amount_paid || 0) / 100,
          currency: invoice.currency || "usd",
          status: "succeeded",
          payment_method: "card",
        })

        if (paymentError) {
          console.error("Error creating payment record:", paymentError)
          return NextResponse.json({ error: "Failed to create payment record" }, { status: 500 })
        }

        console.log(`Recurring payment processed for user ${profile.id}`)
      } catch (error) {
        console.error("Error handling invoice payment succeeded:", error)
        return NextResponse.json({ error: "Failed to handle invoice payment" }, { status: 500 })
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
        })
        .eq("stripe_subscription_id", subscription.id)

      if (updateError) {
        console.error("Error updating subscription status in DB:", updateError)
        return NextResponse.json({ error: "Failed to update subscription status" }, { status: 500 })
      }
      break

    case "customer.subscription.deleted":
      const deletedSubscription = event.data.object as Stripe.Subscription
      const { error: deleteError } = await supabase
        .from("user_subscriptions")
        .update({ status: deletedSubscription.status, ends_at: new Date().toISOString() })
        .eq("stripe_subscription_id", deletedSubscription.id)

      if (deleteError) {
        console.error("Error deleting subscription in DB:", deleteError)
        return NextResponse.json({ error: "Failed to delete subscription status" }, { status: 500 })
      }
      break

    default:
      console.warn(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
