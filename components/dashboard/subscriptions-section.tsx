"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircleIcon, XCircleIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

interface Subscription {
  id: string
  stripe_subscription_id: string
  stripe_price_id: string
  status: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  product_name: string
  product_description: string | null
  price_amount: number
  price_currency: string
  interval: string | null
  interval_count: number | null
}

interface Price {
  id: string
  name: string
  description: string | null
  amount: number
  currency: string
  interval: string | null
}

export function SubscriptionsSection() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [availablePrices, setAvailablePrices] = useState<Price[]>([])
  const [loading, setLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const { user, profile } = useAuth()
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchSubscriptions()
      fetchAvailablePrices()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchSubscriptions = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching subscriptions:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar tus suscripciones.",
        variant: "destructive",
      })
    } else {
      setSubscriptions(data as Subscription[])
    }
    setLoading(false)
  }

  const fetchAvailablePrices = async () => {
    // In a real application, you'd fetch these from your backend or Stripe directly
    // For this example, we'll use mock data or environment variables
    const prices: Price[] = [
      {
        id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD!,
        name: "Plan Estándar",
        description: "Acceso a funciones básicas.",
        amount: 2500, // in cents
        currency: "usd",
        interval: "month",
      },
      {
        id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM!,
        name: "Plan Premium",
        description: "Acceso completo a todas las funciones.",
        amount: 5000, // in cents
        currency: "usd",
        interval: "month",
      },
      // Add other plans as needed
    ]
    setAvailablePrices(prices.filter((p) => p.id)) // Filter out undefined prices if env vars are missing
  }

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para suscribirte.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          customerId: profile?.stripe_customer_id, // Pass existing customer ID if available
        }),
      })

      const data = await response.json()

      if (response.ok && data.url) {
        router.push(data.url) // Redirect to Stripe Checkout
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudo iniciar el proceso de pago.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado.",
        variant: "destructive",
      })
    }
  }

  const handleCancelSubscription = async () => {
    if (!selectedSubscription) return

    setIsCancelling(true)
    try {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscriptionId: selectedSubscription.stripe_subscription_id }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Suscripción Cancelada",
          description: "Tu suscripción ha sido cancelada exitosamente.",
          action: <CheckCircleIcon className="text-green-500" />,
        })
        setIsCancelModalOpen(false)
        fetchSubscriptions() // Refresh subscriptions list
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudo cancelar la suscripción.",
          variant: "destructive",
          action: <XCircleIcon className="text-red-500" />,
        })
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado al cancelar la suscripción.",
        variant: "destructive",
        action: <XCircleIcon className="text-red-500" />,
      })
    } finally {
      setIsCancelling(false)
    }
  }

  const openCancelModal = (subscription: Subscription) => {
    setSelectedSubscription(subscription)
    setIsCancelModalOpen(true)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
      case "trialing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
      case "canceled":
      case "unpaid":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
      case "past_due":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mis Suscripciones</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Cargando suscripciones...</span>
        </CardContent>
      </Card>
    )
  }

  const activeSubscription = subscriptions.find((s) => s.status === "active" || s.status === "trialing")

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Mis Suscripciones</CardTitle>
      </CardHeader>
      <CardContent>
        {subscriptions.length === 0 ? (
          <p className="text-center text-muted-foreground mb-4">No tienes suscripciones activas.</p>
        ) : (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Suscripciones Actuales</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.product_name}</TableCell>
                    <TableCell>
                      {sub.price_amount.toLocaleString(undefined, {
                        style: "currency",
                        currency: sub.price_currency || "USD",
                      })}{" "}
                      / {sub.interval}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClass(sub.status)}>{sub.status}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(sub.current_period_start), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{format(new Date(sub.current_period_end), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="text-right">
                      {(sub.status === "active" || sub.status === "trialing") && !sub.cancel_at_period_end && (
                        <Button variant="destructive" size="sm" onClick={() => openCancelModal(sub)}>
                          Cancelar
                        </Button>
                      )}
                      {sub.cancel_at_period_end && <Badge variant="outline">Cancelación Pendiente</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <h3 className="text-lg font-semibold mb-2">Planes Disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availablePrices.map((price) => (
            <Card key={price.id}>
              <CardHeader>
                <CardTitle>{price.name}</CardTitle>
                <p className="text-2xl font-bold">
                  {(price.amount / 100).toLocaleString(undefined, {
                    style: "currency",
                    currency: price.currency || "USD",
                  })}
                  <span className="text-sm text-muted-foreground">/{price.interval}</span>
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{price.description}</p>
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe(price.id)}
                  disabled={activeSubscription?.stripe_price_id === price.id}
                >
                  {activeSubscription?.stripe_price_id === price.id ? "Plan Actual" : "Suscribirse"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>

      {selectedSubscription && (
        <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Cancelación</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                ¿Estás seguro de que quieres cancelar tu suscripción al plan{" "}
                <span className="font-semibold">{selectedSubscription.product_name}</span>?
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Tu suscripción permanecerá activa hasta el final del período actual (
                {format(new Date(selectedSubscription.current_period_end), "dd/MM/yyyy")}).
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>
                No, mantener
              </Button>
              <Button variant="destructive" onClick={handleCancelSubscription} disabled={isCancelling}>
                {isCancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  "Sí, cancelar"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}
