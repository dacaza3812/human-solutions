"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Loader2 } from "lucide-react"
import { useStripeCheckout } from "@/hooks/use-stripe-checkout"
import { supabaseService, type Plan } from "@/lib/supabase"

interface SubscriptionPlansProps {
  currentPlanId?: number
}

export function SubscriptionPlans({ currentPlanId }: SubscriptionPlansProps) {
  const { createCheckoutSession, loadingStates } = useStripeCheckout()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabaseService.getAllPlans()

        if (error) {
          console.error("Error fetching plans:", error)
          return
        }

        if (data) {
          setPlans(data)
        }
      } catch (error) {
        console.error("Error fetching plans:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  const handleSelectPlan = async (planId: number) => {
    try {
      await createCheckoutSession(planId.toString())
    } catch (error) {
      console.error("Error al procesar el pago:", error)
    }
  }

  if (loading) {
    return (
      <Card className="border-border/40">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando planes...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Elige tu Plan</h2>
        <p className="text-muted-foreground">Selecciona el plan que mejor se adapte a tus necesidades</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <Card
            key={plan.id}
            className={`border-border/40 relative ${
              plan.name === "Premium" ? "border-emerald-500/50 shadow-lg" : ""
            } ${currentPlanId === plan.id ? "ring-2 ring-emerald-500" : ""}`}
          >
            {plan.name === "Premium" && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-emerald-500 text-white">Más Popular</Badge>
              </div>
            )}

            {currentPlanId === plan.id && (
              <div className="absolute -top-3 right-4">
                <Badge className="bg-blue-500 text-white">Plan Actual</Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl text-foreground">{plan.name}</CardTitle>
              <div className="text-3xl font-bold text-emerald-400">
                ${plan.price}
                <span className="text-lg text-muted-foreground">
                  /{plan.billing_interval === "month" ? "mes" : "año"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features?.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={loadingStates[plan.id.toString()] || currentPlanId === plan.id}
                className={`w-full ${
                  plan.name === "Premium" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-primary hover:bg-primary/90"
                }`}
              >
                {loadingStates[plan.id.toString()] ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : currentPlanId === plan.id ? (
                  "Plan Actual"
                ) : (
                  `Seleccionar ${plan.name}`
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
