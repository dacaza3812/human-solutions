import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
})

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { priceId, userId } = await req.json()

    if (!priceId || !userId) {
      return NextResponse.json({ error: "Price ID and User ID are required" }, { status: 400 })
    }

    // Fetch user's profile to get stripe_customer_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single()

    if (profileError || !profile) {
      console.error("Error fetching user profile:", profileError)
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    let customerId = profile.stripe_customer_id

    // If no customer ID, create one
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { userId: userId },
      })
      customerId = customer.id

      // Update user's profile with new customer ID
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", userId)

      if (updateError) {
        console.error("Error updating customer ID in profile:", updateError)
        return NextResponse.json({ error: "Failed to update customer ID" }, { status: 500 })
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/session-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/cancel-subscription?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        userId: userId,
        priceId: priceId,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
