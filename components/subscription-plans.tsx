"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Loader2 } from "lucide-react"
import { useStripeCheckout } from "@/hooks/use-stripe-checkout"
import { supabaseService, type Plan } from "@/lib/supabase" // Import Plan type

interface SubscriptionPlansProps {
  onPlanSelected?: (planId: number) => void
}

export default function SubscriptionPlans({ onPlanSelected }: SubscriptionPlansProps) {
  const { checkout, loadingPlanId } = useStripeCheckout()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlans = async () => {
      setLoadingPlans(true)
      setError(null)
      try {
        const { data, error: fetchError } = await supabaseService.getAllPlans()
        if (fetchError) {
          setError(fetchError.message || "Error al cargar los planes.")
          console.error("Error fetching plans:", fetchError)
          setPlans([]) // Ensure plans is empty on error
          return
        }
        // Use mock plans if no data from Supabase or if data is empty
        if (!data || data.length === 0) {
          console.warn("No plans found in Supabase, using mock data.")
          setPlans([
            {
              id: 1,
              name: "Standard",
              description: "Ideal para necesidades básicas de asesoría.",
              price: 49.99,
              currency: "USD",
              billing_interval: "month",
              stripe_price_id: "price_1Pj1234567890abcdef", // Replace with actual Stripe Price ID
              features: ["3 consultas/mes", "Soporte por email", "Acceso a recursos básicos"],
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 2,
              name: "Premium",
              description: "Para un soporte más completo y personalizado.",
              price: 149.99,
              currency: "USD",
              billing_interval: "month",
              stripe_price_id: "price_1Pj1234567890abcdef", // Replace with actual Stripe Price ID
              features: ["10 consultas/mes", "Soporte prioritario", "Acceso a todos los recursos"],
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 3,
              name: "Collaborative",
              description: "Solución integral para equipos o familias.",
              price: 299.99,
              currency: "USD",
              billing_interval: "month",
              stripe_price_id: "price_1Pj1234567890abcdef", // Replace with actual Stripe Price ID
              features: ["Consultas ilimitadas", "Asesor dedicado 24/7", "Acceso para equipos"],
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
        } else {
          setPlans(data)
        }
      } catch (err: any) {
        setError(err.message || "Error inesperado al cargar los planes.")
        console.error("Unexpected error fetching plans:", err)
        setPlans([]) // Ensure plans is empty on unexpected error
      } finally {
        setLoadingPlans(false)
      }
    }

    fetchPlans()
  }, [])

  if (loadingPlans) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="ml-2 text-muted-foreground">Cargando planes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Error: {error}</p>
        <p>
          Por favor, asegúrate de que tus variables de entorno de Supabase estén configuradas correctamente y que la
          tabla 'plans' exista y contenga datos.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <Card key={plan.id} className="flex flex-col border-border/40 bg-card text-card-foreground">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-foreground">{plan.name}</CardTitle>
            <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 py-4">
            <div className="text-4xl font-extrabold text-emerald-400 mb-4">
              ${plan.price.toFixed(2)}
              <span className="text-lg font-medium text-muted-foreground">
                /{plan.billing_interval === "month" ? "mes" : "año"}
              </span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-4 w-4 text-emerald-500 mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="pt-4">
            <Button
              className="w-full bg-emerald-500 hover:bg-emerald-600"
              onClick={() => {
                checkout(plan.id)
                onPlanSelected?.(plan.id)
              }}
              disabled={loadingPlanId === plan.id}
            >
              {loadingPlanId === plan.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...
                </>
              ) : (
                "Seleccionar Plan"
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
