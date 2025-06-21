"use client"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function useStripeCheckout() {
  const { user, profile, loading: authLoading } = useAuth()
  const [loadingPlanId, setLoadingPlanId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkout = async (planId: number) => {
    if (authLoading) {
      toast({
        title: "Cargando usuario...",
        description: "Por favor, espera mientras cargamos tu información de usuario.",
        variant: "default",
      })
      return
    }

    if (!user) {
      // If user is not logged in, save the selected plan and redirect to login
      localStorage.setItem("selectedPlanId", planId.toString())
      toast({
        title: "Inicia sesión para continuar",
        description: "Por favor, inicia sesión o regístrate para comprar este plan.",
        variant: "default",
      })
      window.location.href = "/login" // Redirect to login page
      return
    }

    setLoadingPlanId(planId)
    setError(null)

    try {
      const stripe = await stripePromise

      if (!stripe) {
        throw new Error("Fallo al cargar Stripe. Por favor, recarga la página.")
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId, userId: user.id }),
      })

      const session = await response.json()

      if (session.error) {
        setError(session.error)
        toast({
          title: "Error al procesar el pago",
          description: session.error,
          variant: "destructive",
        })
        return
      }

      const result = await stripe.redirectToCheckout({
        sessionId: session.sessionId,
      })

      if (result.error) {
        setError(result.error.message || "Error desconocido al redirigir a Stripe.")
        toast({
          title: "Error al procesar el pago",
          description: result.error.message || "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      console.error("Checkout error:", err)
      setError(err.message || "Error interno del servidor al iniciar el checkout.")
      toast({
        title: "Error al procesar el pago",
        description: err.message || "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoadingPlanId(null)
    }
  }

  return { checkout, loadingPlanId, error }
}
