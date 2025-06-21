import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { supabaseService } from "@/lib/supabase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  let planId: string | undefined
  let userId: string | undefined

  try {
    const { planId: receivedPlanId, userId: receivedUserId } = await request.json()

    planId = receivedPlanId
    userId = receivedUserId

    if (!planId || !userId) {
      console.error("Missing required parameters:", { planId, userId })
      return NextResponse.json(
        {
          error: "Plan ID y User ID son requeridos",
        },
        { status: 400 },
      )
    }

    // Validate planId is a number
    const planIdNumber = Number.parseInt(planId.toString())
    if (isNaN(planIdNumber)) {
      console.error("Invalid plan ID:", planId)
      return NextResponse.json(
        {
          error: "Plan ID debe ser un número válido",
        },
        { status: 400 },
      )
    }

    // Get plan details using Supabase service
    const { data: plan, error: planError } = await supabaseService.getPlanById(planId)

    if (planError || !plan) {
      console.error("Plan not found:", planError)
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    // Get user profile using Supabase service
    const { data: profile, error: profileError } = await supabaseService.getProfile(userId)

    if (profileError || !profile) {
      console.error("User not found:", profileError)
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

      // Update profile with Stripe customer ID using Supabase service
      await supabaseService.updateProfile(userId, { stripe_customer_id: customerId })
    }

    // Create line items for Stripe checkout
    let lineItems: any[]

    if (plan.stripe_price_id) {
      // Use existing Stripe Price ID if available
      lineItems = [
        {
          price: plan.stripe_price_id,
          quantity: 1,
        },
      ]
    } else {
      // Create price data dynamically if no Stripe Price ID
      lineItems = [
        {
          price_data: {
            currency: plan.currency.toLowerCase(),
            product_data: {
              name: plan.name,
              description: plan.description || "",
            },
            unit_amount: Math.round(plan.price * 100), // Convert to cents
            recurring: {
              interval: plan.billing_interval as "month" | "year",
            },
          },
          quantity: 1,
        },
      ]
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "subscription",
      success_url: `${request.nextUrl.origin}/success?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/dashboard?canceled=true`,
      metadata: {
        userId: userId,
        planId: planIdNumber.toString(),
        planName: plan.name,
      },
      allow_promotion_codes: true,
      billing_address_collection: "required",
    })

    console.log("Checkout session created successfully:", session.id)
    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error("Detailed error creating checkout session:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      planId,
      userId,
    })

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}
