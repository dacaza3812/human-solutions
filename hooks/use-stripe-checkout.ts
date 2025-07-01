"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

export const useStripeCheckout = () => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { user, profile } = useAuth()

  const createCheckoutSession = async (priceId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para proceder con el pago.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      let customerId = profile?.stripe_customer_id

      // If no Stripe customer ID, create one
      if (!customerId) {
        const { data: newCustomerData, error: newCustomerError } = await supabase
          .from("profiles")
          .select("stripe_customer_id")
          .eq("id", user.id)
          .single()

        if (newCustomerError || !newCustomerData?.stripe_customer_id) {
          // Create customer in Stripe if not found in DB
          const customerResponse = await fetch("/api/stripe/create-customer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email, userId: user.id }),
          })
          const customerData = await customerResponse.json()
          if (customerData.error) {
            throw new Error(customerData.error)
          }
          customerId = customerData.customerId
          // Update profile in DB with new customer ID
          await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id)
        } else {
          customerId = newCustomerData.stripe_customer_id
        }
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, customerId }),
      })
      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        toast({
          title: "Error de Pago",
          description: data.error || "No se pudo iniciar la sesión de pago.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error during checkout:", error)
      toast({
        title: "Error de Pago",
        description: error.message || "Ocurrió un error inesperado al procesar el pago.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return { createCheckoutSession, loading }
}
