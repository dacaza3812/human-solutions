"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStripeCheckout } from "@/hooks/use-stripe-checkout"
import { useAuth } from "@/contexts/auth-context"
import { Heart, DollarSign, Users, CheckCircle, Shield, Zap, Target } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SolucionesHumanas() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [referrals, setReferrals] = useState(1)
  const [monthlyEarnings, setMonthlyEarnings] = useState(25)

  const router = useRouter()
  const { user } = useAuth()
  const { createCheckoutSession, loading, error } = useStripeCheckout()

  const calculateEarnings = (refs: number) => {
    const directCommission = refs * 25
    const indirectCommission = Math.floor(refs * 0.3) * 12.5
    return directCommission + indirectCommission
  }

  const handleReferralChange = (value: string) => {
    const refs = Number.parseInt(value) || 0
    setReferrals(refs)
    setMonthlyEarnings(calculateEarnings(refs))
  }

  const handlePlanSelection = async (planId: number) => {
    if (!user) {
      router.push("/login")
      return
    }

    await createCheckoutSession(planId)
  }

  const navigation = [
    { name: "Inicio", href: "#inicio" },
    { name: "Servicios", href: "#servicios" },
    { name: "Proceso", href: "#proceso" },
    { name: "Compensación", href: "#compensacion" },
    { name: "Planes", href: "#planes" },
    { name: "Contacto", href: "#contacto" },
  ]

  const features = [
    {
      icon: DollarSign,
      title: "Asesoría Financiera",
      description: "Haz que tu salario alcance hasta el final del mes",
      details: "Planificación para tus finanzas personales a corto, mediano y largo plazo.",
      features: ["Generación de ingresos", "Técnicas de ahorro", "Inversión de tu capital"],
    },
    {
      icon: Users,
      title: "Relaciones Familiares",
      description: "Fortalece los vínculos familiares",
      details: "Mejora la comunicación y resuelve conflictos en el hogar.",
      features: ["Mediación de conflictos", "Comunicación efectiva", "Terapia familiar"],
    },
    {
      icon: Heart,
      title: "Problemas de relación",
      description: "Construye relaciones sólidas y duraderas",
      details: "Resolución de conflictos con familiares, amigos, parejas, compañeros o jefes",
      features: [
        "Como potenciar tu inteligencia interpersonal e intrapersonal",
        "Coaching social",
        "Comunicación asertiva",
      ],
    },
    {
      icon: Shield,
      title: "Confidencialidad Total",
      description: "Tu privacidad es nuestra prioridad",
      details: "Todas las consultas son completamente confidenciales y seguras.",
      features: ["100% confidencial", "Datos seguros", "Privacidad garantizada"],
    },
    {
      icon: Zap,
      title: "Respuesta Rápida",
      description: "Obtén ayuda cuando la necesites",
      details: "Respuestas en menos de 24 horas para casos urgentes.",
      features: ["Respuesta < 24h", "Soporte urgente", "Disponibilidad extendida"],
    },
    {
      icon: Target,
      title: "Resultados Medibles",
      description: "Seguimiento de tu progreso",
      details: "Métricas claras para evaluar tu mejora y crecimiento personal.",
      features: ["Métricas de progreso", "Evaluaciones periódicas", "Objetivos claros"],
    },
  ]

  const testimonials = [
    {
      name: "María González",
      username: "@maria_g",
      avatar: "M",
      content:
        "Trabajando en mi próxima aplicación SaaS y quiero que esta sea mi trabajo de tiempo completo porque estoy muy emocionada de armarla. @Fox Lawyer y chill, si quieres 💪",
      verified: true,
    },
    {
      name: "Carlos Rodríguez",
      username: "@carlos_r",
      avatar: "C",
      content:
        "Trabajar con @Fox Lawyer ha sido una de las mejores experiencias de desarrollo que he tenido últimamente. Increíblemente fácil de configurar, gran documentación, y tantos obstáculos para saltar con la competencia. Definitivamente lo usaré en mis próximos proyectos 🔥",
      verified: true,
    },
    {
      name: "Ana Martínez",
      username: "@ana_martinez",
      avatar: "A",
      content:
        "Y'all @Fox Lawyer + @nextjs es increíble! 🙌 Apenas una hora en una prueba de concepto y ya tengo la mayoría de la funcionalidad en su lugar. 😍😍😍",
      verified: true,
    },
    {
      name: "Luis Fernández",
      username: "@luis_dev",
      avatar: "L",
      content:
        "Usando @Fox Lawyer realmente me impresionó el poder de la asesoría personalizada (y sql en general). A pesar de ser un poco dudoso sobre todo el tema de backend como servicio, no he perdido nada. La experiencia se siente muy robusta y segura.",
      verified: true,
    },
    {
      name: "Patricia Silva",
      username: "@patricia_s",
      avatar: "P",
      content:
        "Y gracias a @Fox Lawyer, pude pasar de la idea al lanzamiento de funciones en cuestión de horas. ¡Absolutamente increíble!",
      verified: false,
    },
    {
      name: "Roberto Jiménez",
      username: "@roberto_coach",
      avatar: "R",
      content:
        "@Fox Lawyer Poniendo un montón de consultas de API bien explicadas en una documentación auto-construida es solo un movimiento genial en general. Me gusta tener GraphQL-style en tiempo real.",
      verified: true,
    },
    {
      name: "Elena Vargas",
      username: "@elena_design",
      avatar: "E",
      content:
        "¡Increíble! Fox Lawyer es asombroso. Simplemente ejecuté mi primera consulta y funciona perfectamente. Esto vale la pena. 🚀",
      verified: false,
    },
    {
      name: "Diego Morales",
      username: "@diego_startup",
      avatar: "D",
      content:
        "Este fin de semana hice un progreso personal récord 🏆 en el tiempo que dediqué a crear una aplicación con asesoría familiar / permisos, base de datos, cdn, escalado infinito, git push para desplegar y gratis. Gracias a @Fox Lawyer",
      verified: true,
    },
  ]

  // Duplicate testimonials for infinite scroll
  const duplicatedTestimonials = [...testimonials, ...testimonials]

  const plans = [
    {
      id: 1,
      name: "Standard",
      price: "$49.99",
      frequency: "mensual",
      description: "Ideal para necesidades básicas de asesoría.",
      features: ["3 consultas/mes", "Soporte por email", "Acceso a recursos básicos", "Prioridad estándar"],
      buttonText: "Elegir Plan Standard",
      highlight: false,
    },
    {
      id: 2,
      name: "Premium",
      price: "$149.99",
      frequency: "mensual",
      description: "Para un soporte más completo y personalizado.",
      features: [
        "10 consultas/mes",
        "Soporte prioritario",
        "Acceso a todos los recursos",
        "Seguimiento personalizado",
        "Prioridad alta",
      ],
      buttonText: "Elegir Plan Premium",
      highlight: true,
    },
    {
      id: 3,
      name: "Collaborative",
      price: "$299.99",
      frequency: "mensual",
      description: "Solución integral para equipos o familias.",
      features: [
        "Consultas ilimitadas",
        "Asesor dedicado 24/7",
        "Acceso para equipos",
        "Reportes personalizados",
        "Prioridad empresarial",
      ],
      buttonText: "Elegir Plan Collaborative",
      highlight: false,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center justify-between bg-background border-b">
        <Link className="flex items-center justify-center" href="#">
          <img src="/fox-lawyer-logo.png" alt="Fox Lawyer Logo" className="h-8 w-auto" />
          <span className="sr-only">Soluciones Humanas</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            Características
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#pricing">
            Precios
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#contact">
            Contacto
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Iniciar Sesión
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/register">
            Registrarse
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Gestión Legal Simplificada para Asesores y Clientes
                  </h1>
                  <p className="max-w-[600px] text-gray-200 md:text-xl">
                    Nuestra plataforma conecta a asesores legales con clientes, agilizando la gestión de casos, la
                    comunicación y el seguimiento de pagos.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    className="inline-flex h-10 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-emerald-600 shadow transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
                    href="/register"
                  >
                    Comenzar Ahora
                  </Link>
                  <Link
                    className="inline-flex h-10 items-center justify-center rounded-md border border-white bg-transparent px-8 text-sm font-medium shadow-sm transition-colors hover:bg-white hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-50"
                    href="#features"
                  >
                    Saber Más
                  </Link>
                </div>
              </div>
              <img
                alt="Hero"
                className="mx-auto aspect-[3/2] overflow-hidden rounded-xl object-cover lg:order-last lg:aspect-auto"
                height="400"
                src="/supabase-hero.png"
                width="600"
              />
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-foreground">
                  Características Clave
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Diseñado para optimizar la colaboración y la eficiencia en la gestión legal.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <img
                alt="Features"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
                height="310"
                src="/supabase-features.png"
                width="550"
              />
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-6">
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold text-foreground">Gestión de Casos Integral</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Centraliza todos tus casos, documentos y comunicaciones en un solo lugar.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold text-foreground">Comunicación Fluida</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Mensajería en tiempo real entre asesores y clientes para una colaboración eficiente.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold text-foreground">Seguimiento de Pagos</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Gestiona facturas, pagos y suscripciones de forma segura y automatizada.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-foreground">Planes Flexibles</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Elige el plan que mejor se adapte a tus necesidades, ya seas asesor o cliente.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-sm items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3 py-12">
              <Card className="flex flex-col justify-between h-full">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-foreground">Básico</CardTitle>
                  <p className="text-gray-500 dark:text-gray-400">Ideal para clientes individuales.</p>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow">
                  <div className="text-4xl font-bold text-foreground">
                    $25<span className="text-lg font-normal text-gray-500">/mes</span>
                  </div>
                  <ul className="grid gap-2 py-4 text-gray-500 dark:text-gray-400 flex-grow">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      Acceso a 1 asesor
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      Gestión de 3 casos activos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      Soporte estándar
                    </li>
                  </ul>
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white mt-auto" asChild>
                    <Link href="/payment_process?priceId=price_1PZ410Rz02y202y202y202y2">Elegir Plan</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="flex flex-col justify-between h-full border-2 border-emerald-500">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-foreground">Estándar</CardTitle>
                  <p className="text-gray-500 dark:text-gray-400">Para clientes y asesores en crecimiento.</p>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow">
                  <div className="text-4xl font-bold text-foreground">
                    $75<span className="text-lg font-normal text-gray-500">/mes</span>
                  </div>
                  <ul className="grid gap-2 py-4 text-gray-500 dark:text-gray-400 flex-grow">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      Acceso a 5 asesores
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      Gestión ilimitada de casos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      Soporte prioritario
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      Reportes avanzados
                    </li>
                  </ul>
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white mt-auto" asChild>
                    <Link href="/payment_process?priceId=price_1PZ410Rz02y202y202y202y2">Elegir Plan</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="flex flex-col justify-between h-full">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-foreground">Premium</CardTitle>
                  <p className="text-gray-500 dark:text-gray-400">Solución completa para firmas y equipos.</p>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow">
                  <div className="text-4xl font-bold text-foreground">
                    $150<span className="text-lg font-normal text-gray-500">/mes</span>
                  </div>
                  <ul className="grid gap-2 py-4 text-gray-500 dark:text-gray-400 flex-grow">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      Acceso ilimitado a asesores
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      Gestión ilimitada de casos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      Soporte 24/7
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      Integraciones personalizadas
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      Capacitación exclusiva
                    </li>
                  </ul>
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white mt-auto" asChild>
                    <Link href="/payment_process?priceId=price_1PZ410Rz02y202y202y202y2">Elegir Plan</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section id="contact" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-800">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-foreground">Contáctanos</h2>
            <p className="max-w-[700px] mx-auto mt-4 text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              ¿Tienes preguntas o necesitas una demostración? Estamos aquí para ayudarte.
            </p>
            <div className="mt-8 flex justify-center">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" asChild>
                <Link href="mailto:info@solucioneshumanas.com">Enviar un Correo</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-background">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          &copy; 2024 Soluciones Humanas. Todos los derechos reservados.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4 text-gray-500 dark:text-gray-400" href="#">
            Términos de Servicio
          </Link>
          <Link className="text-xs hover:underline underline-offset-4 text-gray-500 dark:text-gray-400" href="#">
            Política de Privacidad
          </Link>
        </nav>
      </footer>
    </div>
  )
}
