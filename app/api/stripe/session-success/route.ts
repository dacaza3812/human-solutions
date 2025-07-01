import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
})

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get("session_id")

  if (!sessionId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions?status=error`, 302)
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.status === "complete" && session.metadata?.userId && session.subscription) {
      const userId = session.metadata.userId
      const subscriptionId = session.subscription as string // subscription is the ID

      // Update user's profile in Supabase
      const { error } = await supabase
        .from("profiles")
        .update({
          stripe_subscription_id: subscriptionId,
          // You might want to store the priceId or product ID as well
          // current_plan_price_id: session.metadata.priceId,
        })
        .eq("id", userId)

      if (error) {
        console.error("Error updating user subscription in Supabase:", error)
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions?status=error`, 302)
      }

      console.log(`Subscription successful for user ${userId}, subscription ID: ${subscriptionId}`)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions?status=success`, 302)
    } else {
      console.warn("Session not complete or missing metadata:", session)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions?status=pending`, 302)
    }
  } catch (error) {
    console.error("Error retrieving session on success:", error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions?status=error`, 302)
  }
}
