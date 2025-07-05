"use client"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function useStripeCheckout() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createCheckoutSession = async (planId: number) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session.")
      }

      const stripe = await stripePromise
      if (!stripe) {
        throw new Error("Stripe.js failed to load.")
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (stripeError) {
        throw new Error(stripeError.message || "Error redirecting to checkout.")
      }
    } catch (err: any) {
      console.error("Checkout error:", err)
      setError(err.message || "An unexpected error occurred during checkout.")
    } finally {
      setLoading(false)
    }
  }

  return { createCheckoutSession, loading, error }
}
