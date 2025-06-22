import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    // Log para ver todas las cookies que llegan al Route Handler
    const allCookies = cookies()
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
    console.log("Cookies recibidas en create-customer-portal-session:", allCookies)

    // Usar la sintaxis de función para pasar las cookies
    const supabase = createRouteHandlerClient({ cookies: () => cookies() })

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    console.log("Sesión en create-customer-portal-session:", session?.user?.id, "Error:", sessionError?.message)

    if (sessionError || !session) {
      console.error("Error getting session for customer portal:", sessionError?.message || "No session found")
      return NextResponse.json({ error: "Unauthorized: No active session found." }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", session.user.id)
      .single()

    if (profileError || !profile?.stripe_customer_id) {
      console.error(
        "Error fetching profile or stripe_customer_id:",
        profileError?.message || "ID de cliente de Stripe no encontrado.",
      )
      return NextResponse.json({ error: "Stripe customer ID not found for this user." }, { status: 400 })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${request.nextUrl.origin}/dashboard`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error: any) {
    console.error("Error creating customer portal session:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
