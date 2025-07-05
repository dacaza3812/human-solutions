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
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price.product", "subscription"],
    })

    const supabase = createClient()

    // Get user ID from session metadata
    const userId = session.metadata?.supabase_user_id

    if (userId && session.subscription) {
      const subscription = session.subscription as Stripe.Subscription
      const price = session.line_items?.data[0]?.price as Stripe.Price
      const product = price?.product as Stripe.Product

      // Update or insert subscription in your database
      const { data, error } = await supabase.from("subscriptions").upsert(
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
        console.error("Error upserting subscription:", error)
        return NextResponse.json({ error: "Failed to update subscription in DB" }, { status: 500 })
      }

      // Update user's account type to 'premium' or similar if applicable
      await supabase.from("profiles").update({ account_type: "premium" }).eq("id", userId)
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error("Error retrieving checkout session:", error)
    return NextResponse.json({ error: "Failed to retrieve checkout session" }, { status: 500 })
  }
}
