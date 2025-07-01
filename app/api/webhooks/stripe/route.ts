import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const buf = await req.text()
  const sig = req.headers.get("stripe-signature")

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(buf, sig!, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      const subscription = event.data.object as Stripe.Subscription
      const userId = await getUserIdFromStripeCustomerId(subscription.customer as string)

      if (userId) {
        const { error } = await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            price_id: subscription.items.data[0]?.price.id,
          },
          { onConflict: "user_id" },
        )

        if (error) {
          console.error("Error upserting subscription:", error)
          return NextResponse.json({ error: "Database update failed" }, { status: 500 })
        }

        // Update user's account_type based on subscription status
        const newAccountType = subscription.status === "active" ? "client" : "free"
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ account_type: newAccountType })
          .eq("id", userId)

        if (profileError) {
          console.error("Error updating user profile account type:", profileError)
          return NextResponse.json({ error: "Profile update failed" }, { status: 500 })
        }
      }
      break
    case "checkout.session.completed":
      const checkoutSession = event.data.object as Stripe.Checkout.Session
      // This event is already handled by the success_url redirect,
      // but can be used as a fallback or for additional logic.
      break
    case "invoice.payment_succeeded":
      const invoice = event.data.object as Stripe.Invoice

      try {
        // Get user by Stripe customer ID
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("stripe_customer_id", invoice.customer as string)
          .single()

        if (profileError || !profile) {
          console.error("User not found for customer:", invoice.customer as string)
          return
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
        }

        console.log(`Recurring payment processed for user ${profile.id}`)
      } catch (error) {
        console.error("Error handling invoice payment succeeded:", error)
      }
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}

async function getUserIdFromStripeCustomerId(stripeCustomerId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", stripeCustomerId)
    .single()

  if (error) {
    console.error("Error fetching user ID from Stripe customer ID:", error)
    return null
  }

  return data?.id || null
}
