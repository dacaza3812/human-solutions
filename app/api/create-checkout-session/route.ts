import { NextResponse } from "next/server"
import Stripe from "stripe"

import { headers } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
})

export async function POST(req: Request) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const headersList = headers()
  const origin = headersList.get("origin")

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized: No active session found" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    const { priceId, locale } = await req.json()

    if (!priceId) {
      return new NextResponse(JSON.stringify({ error: "Price ID is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    // Get or create Stripe customer
    let customerId: string | null = null
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      return new NextResponse(JSON.stringify({ error: "Error fetching user profile" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id
    } else {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      // Update user profile with new customer ID
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id)

      if (updateError) {
        console.error("Error updating profile with Stripe customer ID:", updateError)
        // Decide how to handle this: proceed or return error
      }
    }

    const successUrl = `${origin}/${locale}/payment_process?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${origin}/${locale}/dashboard`

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
      },
    })

    return new NextResponse(JSON.stringify({ id: session.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error: any) {
    console.error("Error creating checkout session:", error)
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}
