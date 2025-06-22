import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized: No active session found." }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", session.user.id)
      .single()

    if (profileError || !profile?.stripe_customer_id) {
      console.error("Error fetching profile or stripe_customer_id:", profileError)
      return NextResponse.json({ error: "Stripe customer ID not found for this user." }, { status: 400 })
    }

    const customerId = profile.stripe_customer_id
    const returnUrl = request.nextUrl.origin + "/dashboard/subscriptions" // URL a la que Stripe redirigirá después de la gestión

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error: any) {
    console.error("Error creating Stripe Customer Portal session:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
