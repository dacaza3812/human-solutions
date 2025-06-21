"use client"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { useAuth } from "@/contexts/auth-context"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function useStripeCheckout() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const { user } = useAuth()

  const createCheckoutSession = async (planId: string) => {
    if (!user) {
      // Save plan selection for after login
      localStorage.setItem("selectedPlanId", planId)
      window.location.href = "/login"
      return
    }

    try {
      setLoadingStates((prev) => ({ ...prev, [planId]: true }))

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: planId,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      const stripe = await stripePromise
      if (!stripe) {
        throw new Error("Stripe failed to load")
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
      alert("Error al procesar el pago. Por favor, inténtalo de nuevo.")
    } finally {
      setLoadingStates((prev) => ({ ...prev, [planId]: false }))
    }
  }

  return {
    createCheckoutSession,
    loadingStates,
  }
}
