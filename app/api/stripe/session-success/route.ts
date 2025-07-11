import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get("session_id")
  const userId = searchParams.get("user_id")
  const priceId = searchParams.get("price_id")

  if (!sessionId || !userId || !priceId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions?error=missing_params`)
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status === "paid" && session.subscription) {
      const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription.id

      // Update user profile with subscription details
      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          stripe_subscription_id: subscriptionId,
          stripe_price_id: priceId,
          subscription_status: "active",
        })
        .eq("id", userId)

      if (profileUpdateError) {
        console.error("Error updating user profile with subscription:", profileUpdateError)
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions?error=db_update_failed`,
        )
      }

      // Record the payment in the payments table
      const { error: paymentInsertError } = await supabase.from("payments").insert({
        user_id: userId,
        stripe_checkout_session_id: sessionId,
        stripe_subscription_id: subscriptionId,
        amount: session.amount_total ? session.amount_total / 100 : 0, // Amount in USD
        currency: session.currency || "usd",
        status: "succeeded",
        payment_method_type: session.payment_method_types[0] || "unknown",
        plan_id: priceId, // Store the Stripe Price ID as plan_id
      })

      if (paymentInsertError) {
        console.error("Error inserting payment record:", paymentInsertError)
        // This error is less critical for the user, but important for records
      }

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions?success=true`)
    } else {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions?error=payment_not_successful`,
      )
    }
  } catch (error) {
    console.error("Error retrieving checkout session:", error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions?error=stripe_error`)
  }
}
