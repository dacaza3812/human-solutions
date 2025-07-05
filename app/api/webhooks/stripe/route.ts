import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
    }

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const planId = session.metadata?.planId

  if (!userId || !planId) {
    console.error("Missing metadata in checkout session")
    return
  }

  try {
    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

    // Update user profile with subscription info
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        plan_id: Number.parseInt(planId),
        subscription_status: "active",
        stripe_subscription_id: subscription.id,
        subscription_start_date: new Date(subscription.current_period_start * 1000).toISOString(),
        subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq("id", userId)

    if (profileError) {
      console.error("Error updating profile:", profileError)
      return
    }

    // Create payment record
    const { error: paymentError } = await supabase.from("payments").insert({
      user_id: userId,
      plan_id: Number.parseInt(planId),
      stripe_payment_intent_id: session.payment_intent as string,
      amount: (session.amount_total || 0) / 100,
      currency: session.currency || "usd",
      status: "succeeded",
      payment_method: "card",
    })

    if (paymentError) {
      console.error("Error creating payment record:", paymentError)
    }

    console.log(`Subscription activated for user ${userId}`)
  } catch (error) {
    console.error("Error handling checkout session completed:", error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
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
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  try {
    // Get user by Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("stripe_customer_id", customerId)
      .single()

    if (profileError || !profile) {
      console.error("User not found for customer:", customerId)
      return
    }

    // Update subscription status
    const status =
      subscription.status === "active"
        ? "active"
        : subscription.status === "past_due"
          ? "past_due"
          : subscription.status === "canceled"
            ? "cancelled"
            : "inactive"

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        subscription_status: status,
        subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq("id", profile.id)

    if (updateError) {
      console.error("Error updating subscription status:", updateError)
    }

    console.log(`Subscription updated for user ${profile.id}: ${status}`)
  } catch (error) {
    console.error("Error handling subscription updated:", error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  try {
    // Get user by Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("stripe_customer_id", customerId)
      .single()

    if (profileError || !profile) {
      console.error("User not found for customer:", customerId)
      return
    }

    // Update subscription status to cancelled
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        subscription_status: "cancelled",
        subscription_cancelled_at: new Date().toISOString(),
      })
      .eq("id", profile.id)

    if (updateError) {
      console.error("Error updating subscription status:", updateError)
    }

    console.log(`Subscription cancelled for user ${profile.id}`)
  } catch (error) {
    console.error("Error handling subscription deleted:", error)
  }
}
