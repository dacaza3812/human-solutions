import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase-server"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Info } from "lucide-react"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export default async function SubscriptionsSection() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: subscription, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single()

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const isAdvisor = profile?.role === "advisor"

  const handleCancelSubscription = async () => {
    "use server"
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/cancel-subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (res.ok) {
      revalidatePath("/dashboard/subscriptions")
      return { success: true, message: "Suscripción cancelada con éxito." }
    } else {
      const errorData = await res.json()
      return { success: false, message: errorData.error || "Error al cancelar la suscripción." }
    }
  }

  const getPlanDetails = (planId: number | null) => {
    switch (planId) {
      case 1:
        return { name: "Standard", price: "$49.99/mes", features: "3 consultas/mes, Soporte por email" }
      case 2:
        return { name: "Premium", price: "$149.99/mes", features: "10 consultas/mes, Soporte prioritario" }
      case 3:
        return { name: "Collaborative", price: "$299.99/mes", features: "Consultas ilimitadas, Asesor dedicado 24/7" }
      default:
        return { name: "N/A", price: "N/A", features: "Sin plan activo" }
    }
  }

  const planDetails = getPlanDetails(subscription?.plan_id || null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Suscripción</CardTitle>
        <CardDescription>Administra tu plan actual y opciones de pago.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error || !subscription ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Sin Suscripción Activa</AlertTitle>
            <AlertDescription>
              Actualmente no tienes una suscripción activa. Explora nuestros planes para comenzar.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <Alert variant={subscription.status === "active" ? "default" : "destructive"}>
              {subscription.status === "active" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertTitle>Estado: {subscription.status === "active" ? "Activa" : "Inactiva"}</AlertTitle>
              <AlertDescription>
                Tu plan actual es: <span className="font-semibold">{planDetails.name}</span>.
                {subscription.status === "active" && (
                  <>
                    {" "}
                    Válido hasta:{" "}
                    <span className="font-semibold">
                      {format(new Date(subscription.current_period_end), "PPP", { locale: es })}
                    </span>
                    .
                  </>
                )}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-muted/20">
                <CardHeader>
                  <CardTitle className="text-lg">Detalles del Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">Plan:</span> {planDetails.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">Precio:</span> {planDetails.price}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">Características:</span> {planDetails.features}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20">
                <CardHeader>
                  <CardTitle className="text-lg">Información de Facturación</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">ID de Suscripción:</span> {subscription.stripe_subscription_id}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">Inicio del Período:</span>{" "}
                    {format(new Date(subscription.current_period_start), "PPP", { locale: es })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">Fin del Período:</span>{" "}
                    {format(new Date(subscription.current_period_end), "PPP", { locale: es })}
                  </p>
                  {subscription.cancel_at_period_end && (
                    <p className="text-sm text-red-500 mt-2">
                      Tu suscripción se cancelará al final del período actual.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {subscription.status === "active" && !subscription.cancel_at_period_end && (
              <form action={handleCancelSubscription}>
                <Button type="submit" variant="destructive" className="w-full">
                  Cancelar Suscripción
                </Button>
              </form>
            )}
            {subscription.status !== "active" && (
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600">Explorar Planes</Button>
            )}
          </div>
        )}

        {/* Option to change plan or subscribe if not active */}
        {!subscription || subscription.status !== "active" ? (
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">¿Listo para empezar o cambiar de plan?</p>
            <Link href="/#planes">
              <Button className="bg-emerald-500 hover:bg-emerald-600">Ver Planes de Suscripción</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">¿Quieres cambiar tu plan actual?</p>
            <Link href="/#planes">
              <Button variant="outline">Cambiar Plan</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
