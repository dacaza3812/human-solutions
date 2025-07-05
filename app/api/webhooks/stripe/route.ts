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
      const subscriptionId = checkoutSession.subscription as string
      const customerId = checkoutSession.customer as string
      const userId = checkoutSession.metadata?.userId
      const planId = checkoutSession.metadata?.planId

      if (userId && planId && subscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)

          const { error: upsertError } = await supabase.from("user_subscriptions").upsert(
            {
              user_id: userId,
              plan_id: planId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              created_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
          )

          if (upsertError) {
            console.error("Error upserting subscription:", upsertError)
            return NextResponse.json({ error: "Database upsert error" }, { status: 500 })
          }
        } catch (error) {
          console.error("Error retrieving subscription or upserting:", error)
          return NextResponse.json({ error: "Internal server error" }, { status: 500 })
        }
      }
      break
    case "invoice.payment_succeeded":
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionIdSucceeded = invoice.subscription as string

      if (subscriptionIdSucceeded) {
        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionIdSucceeded)
          const userIdFromSubscription = subscription.metadata?.userId // Assuming you store userId in subscription metadata

          if (userIdFromSubscription) {
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
              console.error("Error updating subscription on payment succeeded:", updateError)
              return NextResponse.json({ error: "Database update error" }, { status: 500 })
            }
          }
        } catch (error) {
          console.error("Error handling invoice.payment_succeeded:", error)
          return NextResponse.json({ error: "Internal server error" }, { status: 500 })
        }
      }
      break
    case "customer.subscription.deleted":
      const subscriptionDeleted = event.data.object as Stripe.Subscription
      const userIdDeleted = subscriptionDeleted.metadata?.userId // Assuming you store userId in subscription metadata

      if (userIdDeleted) {
        const { error: deleteError } = await supabase
          .from("user_subscriptions")
          .update({ status: subscriptionDeleted.status, ends_at: new Date().toISOString() }) // Mark as ended
          .eq("stripe_subscription_id", subscriptionDeleted.id)

        if (deleteError) {
          console.error("Error updating subscription on delete:", deleteError)
          return NextResponse.json({ error: "Database update error" }, { status: 500 })
        }
      }
      break
    case "customer.subscription.updated":
      const subscriptionUpdated = event.data.object as Stripe.Subscription
      const userIdUpdated = subscriptionUpdated.metadata?.userId // Assuming you store userId in subscription metadata

      if (userIdUpdated) {
        const { error: updateError } = await supabase
          .from("user_subscriptions")
          .update({
            status: subscriptionUpdated.status,
            current_period_start: new Date(subscriptionUpdated.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscriptionUpdated.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscriptionUpdated.cancel_at_period_end,
          })
          .eq("stripe_subscription_id", subscriptionUpdated.id)

        if (updateError) {
          console.error("Error updating subscription on update:", updateError)
          return NextResponse.json({ error: "Database update error" }, { status: 500 })
        }
      }
      break
    default:
      console.warn(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
