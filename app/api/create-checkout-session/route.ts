import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase-server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
})

const priceIdMap: { [key: number]: string } = {
  1: process.env.STRIPE_PRICE_ID_STANDARD!,
  2: process.env.STRIPE_PRICE_ID_PREMIUM!,
  3: process.env.STRIPE_PRICE_ID_COLLABORATIVE!,
}

export async function POST(req: NextRequest) {
  const { planId } = await req.json()
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
  }

  const priceId = priceIdMap[planId]

  if (!priceId) {
    return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 })
  }

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
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment_process?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/planes`,
      metadata: {
        userId: user.id,
        planId: planId,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error: any) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
