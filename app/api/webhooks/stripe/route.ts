import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
})

const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
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
      const priceId = checkoutSession.metadata?.priceId
      const subscriptionId =
        typeof checkoutSession.subscription === "string"
          ? checkoutSession.subscription
          : checkoutSession.subscription?.id

      if (userId && subscriptionId && priceId && checkoutSession.payment_status === "paid") {
        // Update user profile with subscription details
        const { error: profileUpdateError } = await supabase
          .from("profiles")
          .update({
            stripe_subscription_id: subscriptionId,
            stripe_price_id: priceId,
            subscription_status: "active",
          })
          .eq("id", userId)

        if (profileUpdateError) {
          console.error("Error updating user profile on checkout.session.completed:", profileUpdateError)
        }

        // Record the payment
        const { error: paymentInsertError } = await supabase.from("payments").insert({
          user_id: userId,
          stripe_checkout_session_id: checkoutSession.id,
          stripe_subscription_id: subscriptionId,
          amount: checkoutSession.amount_total ? checkoutSession.amount_total / 100 : 0,
          currency: checkoutSession.currency || "usd",
          status: "succeeded",
          payment_method_type: checkoutSession.payment_method_types[0] || "unknown",
          plan_id: priceId,
        })

        if (paymentInsertError) {
          console.error("Error inserting payment record on checkout.session.completed:", paymentInsertError)
        }
      }
      break
    case "invoice.payment_succeeded":
      const invoicePaymentSucceeded = event.data.object as Stripe.Invoice
      const subscriptionIdSucceeded = invoicePaymentSucceeded.subscription
      const customerIdSucceeded = invoicePaymentSucceeded.customer
      const amountPaidSucceeded = invoicePaymentSucceeded.amount_paid
      const currencySucceeded = invoicePaymentSucceeded.currency

      if (subscriptionIdSucceeded && customerIdSucceeded) {
        // Find the user by stripe_customer_id
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, stripe_price_id")
          .eq("stripe_customer_id", customerIdSucceeded)
          .single()

        if (profileError || !profileData) {
          console.error(
            "Error finding user for invoice.payment_succeeded:",
            profileError?.message || "Profile not found",
          )
          break
        }

        // Update subscription status to active
        const { error: updateProfileError } = await supabase
          .from("profiles")
          .update({ subscription_status: "active" })
          .eq("id", profileData.id)

        if (updateProfileError) {
          console.error("Error updating profile status on invoice.payment_succeeded:", updateProfileError)
        }

        // Record the payment
        const { error: paymentInsertError } = await supabase.from("payments").insert({
          user_id: profileData.id,
          stripe_subscription_id:
            typeof subscriptionIdSucceeded === "string" ? subscriptionIdSucceeded : subscriptionIdSucceeded.id,
          amount: amountPaidSucceeded ? amountPaidSucceeded / 100 : 0,
          currency: currencySucceeded || "usd",
          status: "succeeded",
          payment_method_type: invoicePaymentSucceeded.payment_methods?.data[0]?.type || "unknown",
          plan_id: profileData.stripe_price_id, // Use the price ID from the profile
        })

        if (paymentInsertError) {
          console.error("Error inserting payment record on invoice.payment_succeeded:", paymentInsertError)
        }
      }
      break
    case "invoice.payment_failed":
      const invoicePaymentFailed = event.data.object as Stripe.Invoice
      const customerIdFailed = invoicePaymentFailed.customer

      if (customerIdFailed) {
        // Find the user by stripe_customer_id
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerIdFailed)
          .single()

        if (profileError || !profileData) {
          console.error("Error finding user for invoice.payment_failed:", profileError?.message || "Profile not found")
          break
        }

        // Update subscription status to past_due or unpaid
        const { error: updateProfileError } = await supabase
          .from("profiles")
          .update({ subscription_status: "past_due" }) // Or 'unpaid' depending on your logic
          .eq("id", profileData.id)

        if (updateProfileError) {
          console.error("Error updating profile status on invoice.payment_failed:", updateProfileError)
        }
      }
      break
    case "customer.subscription.deleted":
      const subscriptionDeleted = event.data.object as Stripe.Subscription
      const customerIdDeleted = subscriptionDeleted.customer

      if (customerIdDeleted) {
        // Find the user by stripe_customer_id
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerIdDeleted)
          .single()

        if (profileError || !profileData) {
          console.error(
            "Error finding user for customer.subscription.deleted:",
            profileError?.message || "Profile not found",
          )
          break
        }

        // Update subscription status to canceled and clear subscription IDs
        const { error: updateProfileError } = await supabase
          .from("profiles")
          .update({ subscription_status: "canceled", stripe_subscription_id: null, stripe_price_id: null })
          .eq("id", profileData.id)

        if (updateProfileError) {
          console.error("Error updating profile status on customer.subscription.deleted:", updateProfileError)
        }
      }
      break
    default:
      console.warn(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
