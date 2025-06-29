"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CreditCard,
  Check,
  X,
  Calendar,
  DollarSign,
  Star,
  AlertCircle,
  Download,
  Settings,
  Crown,
  Shield,
} from "lucide-react"

export default function SubscriptionsPage() {
  const [currentPlan, setCurrentPlan] = useState("standard")

  const plans = [
    {
      id: "basic",
      name: "Básico",
      price: "$29",
      period: "/mes",
      description: "Perfecto para usuarios individuales",
      features: [
        "Hasta 5 casos activos",
        "Soporte por email",
        "Documentos básicos",
        "1 GB de almacenamiento",
        "Acceso a la comunidad",
      ],
      limitations: ["Sin videollamadas", "Sin reportes avanzados", "Sin integración API"],
      icon: Shield,
      color: "text-blue-500",
      popular: false,
    },
    {
      id: "standard",
      name: "Estándar",
      price: "$79",
      period: "/mes",
      description: "Ideal para profesionales activos",
      features: [
        "Hasta 25 casos activos",
        "Soporte prioritario",
        "Documentos avanzados",
        "10 GB de almacenamiento",
        "Videollamadas incluidas",
        "Reportes básicos",
        "Calendario integrado",
      ],
      limitations: ["Sin integración API", "Sin reportes personalizados"],
      icon: Star,
      color: "text-emerald-500",
      popular: true,
    },
    {
      id: "premium",
      name: "Premium",
      price: "$149",
      period: "/mes",
      description: "Para equipos y empresas",
      features: [
        "Casos ilimitados",
        "Soporte 24/7",
        "Documentos premium",
        "100 GB de almacenamiento",
        "Videollamadas ilimitadas",
        "Reportes avanzados",
        "Integración API",
        "Múltiples usuarios",
        "Análisis personalizado",
      ],
      limitations: [],
      icon: Crown,
      color: "text-purple-500",
      popular: false,
    },
  ]

  const currentSubscription = {
    plan: "Estándar",
    status: "Activa",
    nextBilling: "2024-02-15",
    amount: "$79.00",
    paymentMethod: "**** **** **** 4242",
    usageStats: {
      cases: { used: 18, limit: 25 },
      storage: { used: 6.2, limit: 10 },
      videoCalls: { used: 45, limit: 100 },
    },
  }

  const billingHistory = [
    {
      id: 1,
      date: "2024-01-15",
      amount: "$79.00",
      status: "Pagado",
      plan: "Estándar",
      invoice: "INV-2024-001",
    },
    {
      id: 2,
      date: "2023-12-15",
      amount: "$79.00",
      status: "Pagado",
      plan: "Estándar",
      invoice: "INV-2023-012",
    },
    {
      id: 3,
      date: "2023-11-15",
      amount: "$79.00",
      status: "Pagado",
      plan: "Estándar",
      invoice: "INV-2023-011",
    },
    {
      id: 4,
      date: "2023-10-15",
      amount: "$29.00",
      status: "Pagado",
      plan: "Básico",
      invoice: "INV-2023-010",
    },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Suscripciones</h1>
          <p className="text-muted-foreground mt-1">Gestiona tu plan y facturación</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Descargar Factura
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600">
            <Settings className="w-4 h-4 mr-2" />
            Gestionar Suscripción
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Current Subscription Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Suscripción Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Plan Actual</p>
                <p className="text-2xl font-bold text-emerald-500">{currentSubscription.plan}</p>
                <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-200">
                  {currentSubscription.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Próxima Facturación</p>
                <p className="text-lg font-semibold">{currentSubscription.nextBilling}</p>
                <p className="text-sm text-muted-foreground">{currentSubscription.amount}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Método de Pago</p>
                <p className="text-lg font-semibold">{currentSubscription.paymentMethod}</p>
                <p className="text-sm text-muted-foreground">Visa</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Renovación Automática</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Uso del Plan</CardTitle>
            <CardDescription>Tu uso actual vs límites del plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Casos Activos</span>
                  <span className="text-sm text-muted-foreground">
                    {currentSubscription.usageStats.cases.used}/{currentSubscription.usageStats.cases.limit}
                  </span>
                </div>
                <Progress
                  value={(currentSubscription.usageStats.cases.used / currentSubscription.usageStats.cases.limit) * 100}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Almacenamiento</span>
                  <span className="text-sm text-muted-foreground">
                    {currentSubscription.usageStats.storage.used}GB/{currentSubscription.usageStats.storage.limit}GB
                  </span>
                </div>
                <Progress
                  value={
                    (currentSubscription.usageStats.storage.used / currentSubscription.usageStats.storage.limit) * 100
                  }
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Videollamadas</span>
                  <span className="text-sm text-muted-foreground">
                    {currentSubscription.usageStats.videoCalls.used}/{currentSubscription.usageStats.videoCalls.limit}
                  </span>
                </div>
                <Progress
                  value={
                    (currentSubscription.usageStats.videoCalls.used / currentSubscription.usageStats.videoCalls.limit) *
                    100
                  }
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="plans" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plans">Planes Disponibles</TabsTrigger>
            <TabsTrigger value="billing">Historial de Facturación</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          {/* Available Plans Tab */}
          <TabsContent value="plans" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <Card key={plan.id} className={`relative ${plan.popular ? "border-emerald-500 shadow-lg" : ""}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-emerald-500 hover:bg-emerald-600">Más Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <plan.icon className={`w-8 h-8 ${plan.color}`} />
                      {currentPlan === plan.id && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Plan Actual
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground ml-1">{plan.period}</span>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="font-medium text-sm">Incluye:</p>
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    {plan.limitations.length > 0 && (
                      <div className="space-y-2">
                        <p className="font-medium text-sm text-muted-foreground">No incluye:</p>
                        {plan.limitations.map((limitation, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <X className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-muted-foreground">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button
                      className={`w-full ${
                        currentPlan === plan.id
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : plan.popular
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : ""
                      }`}
                      disabled={currentPlan === plan.id}
                    >
                      {currentPlan === plan.id ? "Plan Actual" : "Cambiar a este Plan"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Billing History Tab */}
          <TabsContent value="billing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Facturación</CardTitle>
                <CardDescription>Todas tus facturas y pagos anteriores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {billingHistory.map((bill) => (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium">{bill.plan}</p>
                          <p className="text-sm text-muted-foreground">{bill.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">{bill.amount}</p>
                          <Badge
                            variant="outline"
                            className={
                              bill.status === "Pagado"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }
                          >
                            {bill.status}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Facturación</CardTitle>
                  <CardDescription>Gestiona tu información de pago</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Renovación Automática</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Activada
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Método de Pago</span>
                    <span className="text-sm text-muted-foreground">Visa **** 4242</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Moneda</span>
                    <span className="text-sm text-muted-foreground">USD</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Facturación</span>
                    <span className="text-sm text-muted-foreground">Mensual</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Acciones de Cuenta</CardTitle>
                  <CardDescription>Gestiona tu suscripción</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Actualizar Método de Pago
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Calendar className="mr-2 h-4 w-4" />
                    Cambiar Ciclo de Facturación
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar Todas las Facturas
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent text-red-600 hover:text-red-700"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Cancelar Suscripción
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
