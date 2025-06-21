"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Loader2 } from "lucide-react"
import { useStripeCheckout } from "@/hooks/use-stripe-checkout"

const plans = [
  {
    id: "standard",
    name: "Standard",
    price: 29,
    description: "Perfecto para individuos que buscan asesoría básica",
    features: [
      "Consultas ilimitadas por chat",
      "1 consulta telefónica mensual",
      "Documentos básicos incluidos",
      "Soporte por email",
      "Acceso a recursos educativos",
    ],
    popular: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: 59,
    description: "Ideal para familias y pequeñas empresas",
    features: [
      "Todo lo del plan Standard",
      "3 consultas telefónicas mensuales",
      "Documentos avanzados incluidos",
      "Soporte prioritario",
      "Sesiones de planificación financiera",
      "Acceso a webinars exclusivos",
    ],
    popular: true,
  },
  {
    id: "collaborative",
    name: "Collaborative",
    price: 99,
    description: "Para empresas que necesitan asesoría integral",
    features: [
      "Todo lo del plan Premium",
      "Consultas telefónicas ilimitadas",
      "Documentos empresariales incluidos",
      "Soporte 24/7",
      "Asesor dedicado",
      "Revisiones trimestrales",
      "Capacitación para equipos",
    ],
    popular: false,
  },
]

interface SubscriptionPlansProps {
  currentPlanId?: string
}

export function SubscriptionPlans({ currentPlanId }: SubscriptionPlansProps) {
  const { createCheckoutSession, loadingStates } = useStripeCheckout()

  const handleSelectPlan = async (planId: string) => {
    try {
      await createCheckoutSession(planId)
    } catch (error) {
      console.error("Error al procesar el pago:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Elige tu Plan</h2>
        <p className="text-muted-foreground">Selecciona el plan que mejor se adapte a tus necesidades</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`border-border/40 relative ${
              plan.popular ? "border-emerald-500/50 shadow-lg" : ""
            } ${currentPlanId === plan.id ? "ring-2 ring-emerald-500" : ""}`}
          >
            {plan.popular && (
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
                <span className="text-lg text-muted-foreground">/mes</span>
              </div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={loadingStates[plan.id] || currentPlanId === plan.id}
                className={`w-full ${
                  plan.popular ? "bg-emerald-500 hover:bg-emerald-600" : "bg-primary hover:bg-primary/90"
                }`}
              >
                {loadingStates[plan.id] ? (
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
