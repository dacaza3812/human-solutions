import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { Database } from "@/database.types"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
})

const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Check if payment was successful
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 })
    }

    const userId = session.metadata?.userId
    const planId = session.metadata?.planId

    if (!userId || !planId) {
      return NextResponse.json({ error: "Missing user or plan information" }, { status: 400 })
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase.from("plans").select("*").eq("id", planId).single()

    if (planError || !plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    // Update user profile with subscription info
    const subscriptionEndDate = new Date()
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1)

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        plan_id: planId,
        subscription_status: "active",
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: subscriptionEndDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (profileError) {
      console.error("Error updating profile:", profileError)
      return NextResponse.json({ error: "Error updating user profile" }, { status: 500 })
    }

    // Record the payment
    const { error: paymentError } = await supabase.from("payments").insert({
      user_id: userId,
      plan_id: planId,
      stripe_payment_intent_id: session.payment_intent,
      stripe_checkout_session_id: sessionId,
      amount: session.amount_total ? session.amount_total / 100 : plan.price,
      currency: session.currency || "usd",
      status: "succeeded",
      created_at: new Date().toISOString(),
    })

    if (paymentError) {
      console.error("Error recording payment:", paymentError)
      // Don't return error here as the subscription is already active
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and subscription activated",
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "Error verifying payment" }, { status: 500 })
  }
}
