import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get("session_id")

  if (!sessionId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions?status=cancelled`, 302)
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // You can add logic here to handle the cancelled subscription,
    // e.g., log it, send a notification, or update your database if needed.
    console.log(`Subscription cancelled for session: ${sessionId}`)
    console.log("Customer ID:", session.customer)
    console.log("Subscription ID:", session.subscription)

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions?status=cancelled`, 302)
  } catch (error) {
    console.error("Error retrieving session on cancel:", error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions?status=error`, 302)
  }
}
