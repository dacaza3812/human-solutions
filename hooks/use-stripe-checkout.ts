"use client"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { useAuth } from "@/contexts/auth-context"

// Cambiar de 'const useStripeCheckout = () => {' a 'export function useStripeCheckout() {'
// Y eliminar la línea 'export default useStripeCheckout' al final del archivo.
export function useStripeCheckout() {
  const [loading, setLoading] = useState(false)
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

  const { user, session } = useAuth()

  const createCheckoutSession = async (planId: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
        },
        body: JSON.stringify({ planId, userId: user?.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Usar response.ok para verificar el estado HTTP
        throw new Error(data.message || "Error al crear la sesión de pago")
      }

      const stripe = await stripePromise
      if (!stripe) {
        throw new Error("Error al cargar Stripe")
      }
      stripe.redirectToCheckout({ sessionId: data.sessionId })
    } catch (error: any) {
      console.error("Error creating checkout session:", error.message)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return { createCheckoutSession, loading }
}
