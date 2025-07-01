"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

export default function PaymentProcessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const priceId = searchParams.get("priceId")
  const { user, profile, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [productName, setProductName] = useState("Plan de Suscripción")
  const [productPrice, setProductPrice] = useState("Cargando...")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      toast({
        title: "Acceso Denegado",
        description: "Por favor, inicia sesión para continuar con el proceso de pago.",
        variant: "destructive",
      })
    }
  }, [user, authLoading, router, toast])

  useEffect(() => {
    const fetchPriceDetails = async () => {
      if (priceId) {
        try {
          const response = await fetch(`/api/stripe/get-price-details?priceId=${priceId}`)
          const data = await response.json()
          if (data.error) {
            console.error("Error fetching price details:", data.error)
            setProductName("Plan Desconocido")
            setProductPrice("Error")
            toast({
              title: "Error",
              description: "No se pudieron cargar los detalles del plan.",
              variant: "destructive",
            })
          } else {
            setProductName(data.productName)
            setProductPrice(`$${(data.unitAmount / 100).toFixed(2)}/${data.interval}`)
          }
        } catch (error) {
          console.error("Failed to fetch price details:", error)
          setProductName("Plan Desconocido")
          setProductPrice("Error")
          toast({
            title: "Error",
            description: "No se pudieron cargar los detalles del plan.",
            variant: "destructive",
          })
        }
      } else {
        setProductName("No se seleccionó ningún plan")
        setProductPrice("N/A")
        toast({
          title: "Error",
          description: "No se ha especificado un plan de suscripción.",
          variant: "destructive",
        })
      }
    }

    fetchPriceDetails()
  }, [priceId, toast])

  const handleCheckout = async () => {
    if (!user || !priceId) {
      toast({
        title: "Error",
        description: "No se pudo iniciar el proceso de pago. Por favor, inténtalo de nuevo.",
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
        router.push(data.url)
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

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="text-muted-foreground">Cargando información de usuario...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Proceso de Pago</CardTitle>
          <CardDescription>Confirma los detalles de tu suscripción.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Detalles del Plan:</h3>
            <p>
              <span className="font-medium">Plan:</span> {productName}
            </p>
            <p>
              <span className="font-medium">Precio:</span> {productPrice}
            </p>
          </div>
          <Button onClick={handleCheckout} className="w-full bg-emerald-500 hover:bg-emerald-600" disabled={loading}>
            {loading ? "Redirigiendo al pago..." : "Proceder al Pago"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
