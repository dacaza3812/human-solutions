"use client"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { useTranslations } from "@/components/i18n-provider"

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function useStripeCheckout() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslations()

  const redirectToCheckout = async (priceId: string, locale: string) => {
    setLoading(true)
    setError(null)

    try {
      const stripe = await stripePromise

      if (!stripe) {
        throw new Error("Stripe failed to load.")
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId, locale }), // Pass locale to the API route
      })

      const session = await response.json()

      if (session.error) {
        setError(session.error)
        setLoading(false)
        return
      }

      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      })

      if (result.error) {
        setError(result.error.message)
      }
    } catch (err: any) {
      console.error("Checkout error:", err)
      setError(err.message || t("common.unexpected_error"))
    } finally {
      setLoading(false)
    }
  }

  return { redirectToCheckout, loading, error }
}
