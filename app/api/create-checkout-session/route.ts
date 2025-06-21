import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { supabaseAdmin, supabaseService } from "@/lib/supabase" // Import supabaseAdmin and supabaseService

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  let planId: string | undefined
  let userId: string | undefined

  try {
    const { planId: receivedPlanId, userId: receivedUserId } = await request.json()

    planId = receivedPlanId
    userId = receivedUserId

    console.log("Checkout session request:", { planId, userId })

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
    console.log("Fetching plan:", planIdNumber)
    const { data: plan, error: planError } = await supabaseService.getPlanById(planIdNumber)

    if (planError || !plan) {
      console.error("Plan not found:", planError)
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 })
    }

    console.log("Plan found:", plan.name)

    // Get user profile with retry logic
    console.log("Fetching user profile:", userId)
    let profile = null
    let profileError = null

    // Try multiple times to get the profile (in case it was just created)
    for (let i = 0; i < 3; i++) {
      const result = await supabaseService.getProfile(userId)
      profile = result.data
      profileError = result.error

      if (profile) {
        console.log("Profile found:", profile.email)
        break
      }

      if (i < 2) {
        console.log(`Profile not found, retrying in 1 second... (attempt ${i + 1}/3)`)
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    // If profile still not found, try to get user from auth and create profile
    if (!profile) {
      console.log("Profile not found, attempting to get user from auth...")

      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)

      if (authError || !authUser.user) {
        console.error("User not found in auth:", authError)
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
      }

      console.log("User found in auth, creating profile...")

      // Create profile from auth user data
      const newProfile = {
        id: authUser.user.id,
        email: authUser.user.email!,
        first_name: authUser.user.user_metadata?.first_name || "",
        last_name: authUser.user.user_metadata?.last_name || "",
        phone: authUser.user.user_metadata?.phone || "",
        account_type: authUser.user.user_metadata?.account_type || "client",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: createdProfile, error: createError } = await supabaseAdmin
        .from("profiles")
        .upsert([newProfile], { onConflict: "id" })
        .select()
        .single()

      if (createError) {
        console.error("Error creating profile:", createError)
        return NextResponse.json({ error: "Error creando perfil de usuario" }, { status: 500 })
      }

      profile = createdProfile
      console.log("Profile created successfully:", profile.email)
    }

    // Create or retrieve Stripe customer
    let customerId = profile.stripe_customer_id

    if (!customerId) {
      console.log("Creating Stripe customer...")
      const customer = await stripe.customers.create({
        email: profile.email,
        name: `${profile.first_name} ${profile.last_name}`.trim() || profile.email,
        metadata: {
          userId: userId,
        },
      })
      customerId = customer.id

      // Update profile with Stripe customer ID
      await supabaseService.updateProfile(userId, { stripe_customer_id: customerId })
      console.log("Stripe customer created:", customerId)
    } else {
      console.log("Using existing Stripe customer:", customerId)
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
      console.log("Using existing Stripe price:", plan.stripe_price_id)
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
      console.log("Creating dynamic price for plan:", plan.name)
    }

    // Create Stripe checkout session
    console.log("Creating Stripe checkout session...")
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "subscription",
      success_url: `${request.nextUrl.origin}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/dashboard?canceled=true`,
      metadata: {
        userId: userId,
        planId: planIdNumber.toString(),
        planName: plan.name,
      },
      allow_promotion_codes: true,
      billing_address_collection: "required",
      subscription_data: {
        metadata: {
          userId: userId,
          planId: planIdNumber.toString(),
        },
      },
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
