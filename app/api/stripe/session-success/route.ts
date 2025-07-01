import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
})

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id")

  if (!sessionId) {
    return NextResponse.redirect(new URL("/dashboard/subscriptions?status=error", process.env.NEXT_PUBLIC_BASE_URL))
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.status === "complete" && session.customer && session.subscription) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Update user's profile with Stripe customer ID and subscription ID
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            account_type: "client", // Assuming successful payment means client account
          })
          .eq("id", user.id)

        if (profileError) {
          console.error("Error updating user profile with Stripe info:", profileError)
          return NextResponse.redirect(
            new URL("/dashboard/subscriptions?status=error", process.env.NEXT_PUBLIC_BASE_URL),
          )
        }

        // Optionally, update the subscription status in your database
        const { error: subscriptionError } = await supabase.from("subscriptions").upsert(
          {
            user_id: user.id,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            status: "active",
            current_period_start: new Date(session.current_period_start * 1000).toISOString(),
            current_period_end: new Date(session.current_period_end * 1000).toISOString(),
            price_id: session.line_items?.data[0]?.price?.id,
          },
          { onConflict: "user_id" },
        )

        if (subscriptionError) {
          console.error("Error upserting subscription:", subscriptionError)
          return NextResponse.redirect(
            new URL("/dashboard/subscriptions?status=error", process.env.NEXT_PUBLIC_BASE_URL),
          )
        }
      }
    }

    return NextResponse.redirect(new URL("/dashboard/subscriptions?status=success", process.env.NEXT_PUBLIC_BASE_URL))
  } catch (error) {
    console.error("Error retrieving checkout session:", error)
    return NextResponse.redirect(new URL("/dashboard/subscriptions?status=error", process.env.NEXT_PUBLIC_BASE_URL))
  }
}
