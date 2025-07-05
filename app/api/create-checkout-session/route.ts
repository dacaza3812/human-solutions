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

  const { planId } = await req.json()

  let priceId: string
  let successUrl: string
  let cancelUrl: string

  switch (planId) {
    case 1:
      priceId = process.env.STRIPE_PRICE_ID_STANDARD!
      break
    case 2:
      priceId = process.env.STRIPE_PRICE_ID_PREMIUM!
      break
    case 3:
      priceId = process.env.STRIPE_PRICE_ID_COLLABORATIVE!
      break
    default:
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 })
  }

  successUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/session-success?session_id={CHECKOUT_SESSION_ID}`
  cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions?canceled=true`

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: user.email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user.id,
        planId: planId,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
