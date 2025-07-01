import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
})

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
])

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature") as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event

  try {
    if (!sig || !webhookSecret) {
      console.error("Stripe signature or webhook secret missing.")
      return new NextResponse("Webhook Error: Stripe signature or webhook secret missing.", { status: 400 })
    }
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case "checkout.session.completed":
          const checkoutSession = event.data.object as Stripe.Checkout.Session
          const customerId = checkoutSession.customer as string
          const subscriptionId = checkoutSession.subscription as string
          const userId = checkoutSession.metadata?.userId

          if (userId && customerId && subscriptionId) {
            const { error } = await supabase
              .from("profiles")
              .update({
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
              })
              .eq("id", userId)

            if (error) {
              console.error("Supabase update error (checkout.session.completed):", error)
              return new NextResponse("Webhook Error: Supabase update failed", { status: 500 })
            }
            console.log(`User ${userId} linked to customer ${customerId} and subscription ${subscriptionId}`)
          }
          break

        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          const subscription = event.data.object as Stripe.Subscription
          const customer = subscription.customer as string // This is the customer ID

          // Find the user in your profiles table by stripe_customer_id
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", customer)
            .single()

          if (profileError || !profile) {
            console.error("Error finding profile for customer:", customer, profileError)
            return new NextResponse("Webhook Error: Profile not found for customer", { status: 404 })
          }

          const userIdFromProfile = profile.id

          let newSubscriptionStatus: string | null = null
          if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
            newSubscriptionStatus = subscription.status
          } else if (event.type === "customer.subscription.deleted") {
            newSubscriptionStatus = "cancelled" // Or 'inactive', 'ended', etc. based on your schema
          }

          const { error: updateSubError } = await supabase
            .from("profiles")
            .update({
              stripe_subscription_id: subscription.id,
              // You might want to store the subscription status as well
              // subscription_status: newSubscriptionStatus,
            })
            .eq("id", userIdFromProfile)

          if (updateSubError) {
            console.error("Supabase update error (subscription event):", updateSubError)
            return new NextResponse("Webhook Error: Supabase subscription update failed", { status: 500 })
          }
          console.log(
            `Subscription ${subscription.id} for user ${userIdFromProfile} updated to status: ${newSubscriptionStatus}`,
          )
          break

        default:
          console.warn(`Unhandled event type: ${event.type}`)
      }
    } catch (error: any) {
      console.error("Webhook handler error:", error.message)
      return new NextResponse(`Webhook handler error: ${error.message}`, { status: 500 })
    }
  }

  return new NextResponse("Success", { status: 200 })
}
