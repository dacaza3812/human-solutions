"use client"

import { useState } from "react"
import { Star, Crown, Shield } from "lucide-react"
import { Suspense } from "react"
import SubscriptionsSection from "@/components/dashboard/subscriptions-section"
import SubscriptionsLoading from "@/components/dashboard/subscriptions-loading" // Assuming you'll create a loading component for subscriptions

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
    <div className="grid gap-6 p-6 md:p-8">
      <h1 className="text-3xl font-bold">Mi Suscripción</h1>
      <Suspense fallback={<SubscriptionsLoading />}>
        <SubscriptionsSection />
      </Suspense>
    </div>
  )
}
