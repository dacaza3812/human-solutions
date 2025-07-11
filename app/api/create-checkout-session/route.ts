import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
})

export async function POST(req: NextRequest) {
  const { priceId, userId, userEmail } = await req.json()

  if (!priceId || !userId || !userEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    // Check if user already has a Stripe customer ID
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("Error fetching user profile:", profileError)
      throw new Error("Failed to fetch user profile.")
    }

    let customerId = profileData?.stripe_customer_id

    if (!customerId) {
      // Create a new Stripe customer if one doesn't exist
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId,
        },
      })
      customerId = customer.id

      // Save the new customer ID to the user's profile in Supabase
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", userId)

      if (updateError) {
        console.error("Error updating user profile with Stripe customer ID:", updateError)
        throw new Error("Failed to update user profile with Stripe customer ID.")
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
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/session-success?session_id={CHECKOUT_SESSION_ID}&user_id=${userId}&price_id=${priceId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions?canceled=true`,
      metadata: {
        userId: userId,
        priceId: priceId,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
