import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase-server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
})

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { priceId, customerId } = await req.json()

  if (!priceId) {
    return NextResponse.json({ error: "Price ID is required" }, { status: 400 })
  }

  let stripeCustomerId = customerId

  // If no customerId is provided, create a new Stripe customer
  if (!stripeCustomerId) {
    try {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      stripeCustomerId = customer.id

      // Update Supabase profile with the new Stripe customer ID
      await supabase.from("profiles").update({ stripe_customer_id: stripeCustomerId }).eq("id", user.id)
    } catch (error) {
      console.error("Error creating Stripe customer:", error)
      return NextResponse.json({ error: "Failed to create Stripe customer" }, { status: 500 })
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment_process?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions`,
      metadata: {
        supabase_user_id: user.id,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
