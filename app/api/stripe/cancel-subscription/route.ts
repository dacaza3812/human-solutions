import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId } = await request.json()

    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 })
    }

    // Log para depuración - verificar cookies recibidas
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    console.log(
      "Cookies received in cancel-subscription:",
      allCookies.map((c) => c.name),
    )

    // Buscar específicamente la cookie de Supabase
    const supabaseCookie = allCookies.find(
      (cookie) => cookie.name.includes("sb-") && cookie.name.includes("auth-token"),
    )
    console.log("Supabase auth cookie found:", supabaseCookie ? "YES" : "NO")

    // Verificar variables de entorno críticas
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error("NEXT_PUBLIC_SUPABASE_URL is missing")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    if (!process.env.SUPABASE_JWT_SECRET) {
      console.error("SUPABASE_JWT_SECRET is missing")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Crear cliente de Supabase con configuración explícita
    const supabase = createServerComponentClient({
      cookies,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })

    // Intentar obtener la sesión
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    console.log("Session retrieval result:", {
      hasSession: !!session,
      sessionError: sessionError?.message,
      userId: session?.user?.id,
    })

    if (sessionError) {
      console.error("Session error:", sessionError)
      return NextResponse.json({ error: `Authentication error: ${sessionError.message}` }, { status: 401 })
    }

    if (!session || !session.user) {
      console.error("No valid session found")
      return NextResponse.json({ error: "No active session found. Please log in again." }, { status: 401 })
    }

    console.log("Attempting to cancel subscription:", subscriptionId, "for user:", session.user.id)

    // Verificar que el usuario tenga acceso a esta suscripción
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_subscription_id, stripe_customer_id")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      console.error("Error fetching user profile:", profileError)
      return NextResponse.json({ error: "Failed to verify user subscription access" }, { status: 403 })
    }

    if (profileData.stripe_subscription_id !== subscriptionId) {
      console.error("Subscription ID mismatch:", {
        requested: subscriptionId,
        userSubscription: profileData.stripe_subscription_id,
      })
      return NextResponse.json({ error: "You don't have permission to cancel this subscription" }, { status: 403 })
    }

    // Cancelar la suscripción en Stripe
    console.log("Canceling subscription in Stripe...")
    const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId)
    console.log("Stripe cancellation successful:", canceledSubscription.id, "status:", canceledSubscription.status)

    // Actualizar el estado en Supabase
    console.log("Updating subscription status in Supabase...")
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        subscription_status: "canceled",
        subscription_cancelled_at: new Date().toISOString(),
      })
      .eq("id", session.user.id)

    if (updateError) {
      console.error("Error updating subscription status in Supabase:", updateError)
      // Aunque falló la actualización en Supabase, la cancelación en Stripe fue exitosa
      return NextResponse.json(
        {
          success: true,
          subscription: canceledSubscription,
          warning: "Subscription canceled in Stripe but failed to update local status",
        },
        { status: 200 },
      )
    }

    console.log("Subscription cancellation completed successfully")
    return NextResponse.json({
      success: true,
      subscription: canceledSubscription,
    })
  } catch (error: any) {
    console.error("Unexpected error in cancel-subscription:", error)

    // Proporcionar diferentes mensajes según el tipo de error
    if (error.type === "StripeInvalidRequestError") {
      return NextResponse.json({ error: `Stripe error: ${error.message}` }, { status: 400 })
    }

    if (error.code === "resource_missing") {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    return NextResponse.json({ error: error.message || "Internal server error during cancellation" }, { status: 500 })
  }
}
