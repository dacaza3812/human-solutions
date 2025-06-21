import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { planId } = await request.json()

    // Obtener la sesión del usuario desde Supabase
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    if (!planId || !userId) {
      return NextResponse.json({ error: "Plan ID and User ID are required" }, { status: 400 })
    }

    // Get plan details from database using Prisma
    const { data: plan, error: planError } = await supabase.from("plans").select("*").eq("id", planId).single()

    if (planError || !plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create or retrieve Stripe customer
    let customerId = profile.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email,
        name: `${profile.first_name} ${profile.last_name}`,
        metadata: {
          userId: userId,
        },
      })
      customerId = customer.id

      // Update profile with Stripe customer ID
      await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", userId)
    }

    // Create Stripe checkout session
    const sessionStripe = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.stripe_price_id, // Usa el Stripe Price ID de tu DB
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${request.nextUrl.origin}/success?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/?canceled=true`,
      metadata: {
        userId: userId,
        planId: planId.toString(),
        planName: plan.name,
      },
    })

    return NextResponse.json({ sessionId: sessionStripe.id })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
