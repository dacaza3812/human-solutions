"use client"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function useStripeCheckout() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const createCheckoutSession = async (planId: string) => {
    setError(null)

    if (!user) {
      // Save plan selection for after login
      localStorage.setItem("selectedPlanId", planId)
      window.location.href = "/login"
      return
    }

    try {
      setLoadingStates((prev) => ({ ...prev, [planId]: true }))

      // Validate that we have the required environment variables
      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        throw new Error("Stripe configuration is missing")
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: Number.parseInt(planId),
          userId: user.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.sessionId) {
        throw new Error("No session ID received from server")
      }

      const stripe = await stripePromise
      if (!stripe) {
        throw new Error("Stripe failed to load")
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (stripeError) {
        throw new Error(stripeError.message || "Error redirecting to checkout")
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al procesar el pago"
      setError(errorMessage)

      toast({
        title: "Error al procesar el pago",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoadingStates((prev) => ({ ...prev, [planId]: false }))
    }
  }

  const clearError = () => setError(null)

  return {
    createCheckoutSession,
    loadingStates,
    error,
    clearError,
  }
}
