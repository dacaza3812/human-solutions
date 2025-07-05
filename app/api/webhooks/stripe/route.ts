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
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      const subscription = event.data.object as Stripe.Subscription
      const customer = (await stripe.customers.retrieve(subscription.customer as string)) as Stripe.Customer
      const price = await stripe.prices.retrieve(subscription.items.data[0].price.id, { expand: ["product"] })
      const product = price.product as Stripe.Product

      const userId = customer.metadata.supabase_user_id

      if (userId) {
        const { error } = await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            stripe_price_id: price.id,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            product_name: product.name,
            product_description: product.description,
            price_amount: price.unit_amount ? price.unit_amount / 100 : 0,
            price_currency: price.currency,
            interval: price.recurring?.interval,
            interval_count: price.recurring?.interval_count,
          },
          { onConflict: "stripe_subscription_id" },
        )

        if (error) {
          console.error("Error upserting subscription in webhook:", error)
          return NextResponse.json({ error: "Failed to update subscription in DB" }, { status: 500 })
        }

        // Update user's account type based on subscription status
        if (subscription.status === "active" || subscription.status === "trialing") {
          await supabase.from("profiles").update({ account_type: "premium" }).eq("id", userId)
        } else {
          await supabase.from("profiles").update({ account_type: "client" }).eq("id", userId) // Revert to default role
        }
      }
      break
    case "checkout.session.completed":
      const checkoutSession = event.data.object as Stripe.Checkout.Session
      // This case is already handled by the success_url redirect, but can be used as a fallback
      console.log("Checkout session completed:", checkoutSession.id)
      break
    default:
      console.warn(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
