import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { supabaseService } from "@/lib/supabase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { planId, userId } = await request.json()

    if (!planId || !userId) {
      return NextResponse.json({ error: "Plan ID and User ID are required" }, { status: 400 })
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
      cancel_url: `${request.nextUrl.origin}/?canceled=true`,
      metadata: {
        userId: userId,
        planId: planId.toString(),
        planName: plan.name,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
