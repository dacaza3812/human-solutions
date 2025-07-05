"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { useStripeCheckout } from "@/hooks/use-stripe-checkout"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Heart,
  DollarSign,
  Users,
  FileText,
  Upload,
  CheckCircle,
  Menu,
  Shield,
  Target,
  TrendingUp,
  MessageCircle,
  Award,
  Globe,
  Smartphone,
  Laptop,
  Database,
  Lock,
  BarChart3,
  ArrowRight,
  X,
  MessageCircleQuestion,
  CircleDashed,
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  Loader2,
  AlertCircle,
  File,
  CheckCircleIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { submitContactForm } from "@/actions/contact"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Componente para el botón de envío con estado de carga
function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button type="submit" disabled={isPending} className="flex-1 bg-emerald-500 hover:bg-emerald-600">
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Enviando...
        </>
      ) : (
        "Enviar Mensaje"
      )}
    </Button>
  )
}

export default function SolucionesHumanas() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [referrals, setReferrals] = useState(1)
  const [monthlyEarnings, setMonthlyEarnings] = useState(25)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const contactFormRef = useRef<HTMLFormElement>(null)

  const router = useRouter()
  const { user } = useAuth()
  const { createCheckoutSession, loading, error } = useStripeCheckout()
  const { toast } = useToast()

  const [isPending, setIsPending] = useState(false)
  const [formState, setFormState] = useState({
    success: false,
    message: "",
    errors: {},
  })

  // Show toast notification based on form submission result
  useEffect(() => {
    if (formState.message) {
      toast({
        title: formState.success ? "Éxito" : "Error",
        description: formState.message,
        variant: formState.success ? "default" : "destructive",
      })
      if (formState.success) {
        contactFormRef.current?.reset()
        setSelectedFile(null)
        setFilePreviewUrl(null)
      }
    }
  }, [formState.message, formState.success, toast])

  const handleContactFormSubmit = async (formData: FormData) => {
    setIsPending(true)
    const result = await submitContactForm(formState, formData) // Pass prevState as first argument
    setFormState(result)
    setIsPending(false)

    if (result.success) {
      toast({
        title: "Éxito",
        description: result.message,
        action: <CheckCircleIcon className="text-green-500" />,
      })
      contactFormRef.current?.reset() // Clear form fields on success
      setSelectedFile(null)
      setFilePreviewUrl(null)
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      })
    }
  }

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setSelectedFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setFilePreviewUrl(null)
    }
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
      title: "Asesoría Financiera",
      description: "Expertos en finanzas personales y empresariales para optimizar tus recursos.",
      icon: "/placeholder.svg?height=64&width=64",
    },
    {
      title: "Relaciones Familiares",
      description: "Mediación y apoyo para fortalecer los lazos y resolver conflictos familiares.",
      icon: "/placeholder.svg?height=64&width=64",
    },
    {
      title: "Asesoría Legal",
      description: "Orientación y representación en diversas áreas del derecho para proteger tus intereses.",
      icon: "/placeholder.svg?height=64&width=64",
    },
    {
      title: "Desarrollo Personal",
      description: "Coaching y herramientas para potenciar tu crecimiento y bienestar individual.",
      icon: "/placeholder.svg?height=64&width=64",
    },
    {
      title: "Salud y Bienestar",
      description: "Programas integrales para mejorar tu salud física y mental.",
      icon: "/placeholder.svg?height=64&width=64",
    },
  ]

  const testimonials = [
    {
      name: "Ana G.",
      quote: "La asesoría financiera me ayudó a organizar mis deudas y empezar a ahorrar. ¡Totalmente recomendado!",
      avatar: "/placeholder-user.jpg",
    },
    {
      name: "Carlos R.",
      quote: "Gracias a la mediación familiar, pudimos resolver nuestros conflictos y mejorar la comunicación.",
      avatar: "/placeholder-user.jpg",
    },
    {
      name: "Sofía M.",
      quote: "El equipo legal fue excepcional. Me sentí apoyada y bien representada en todo momento.",
      avatar: "/placeholder-user.jpg",
    },
    {
      name: "Javier L.",
      quote: "Los programas de desarrollo personal me dieron las herramientas para alcanzar mis metas.",
      avatar: "/placeholder-user.jpg",
    },
  ]

  // Duplicate testimonials for infinite scroll
  const duplicatedTestimonials = [...testimonials, ...testimonials]
  const duplicatedFeatures = [...features, ...features] // Duplicate features for infinite scroll

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
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image src="/fox-lawyer-logo.png" alt="Fox Lawyer" width={32} height={32} />
              <h1 className="text-xl font-bold text-foreground">Fox Lawyer</h1>
            </div>

            <div className="flex items-center space-x-6">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-8">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </a>
                ))}
              </nav>

              <div className="flex items-center space-x-3">
                <ThemeToggle />
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:inline-flex border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-white bg-transparent"
                  onClick={() => router.push("/dashboard")}
                >
                  Dashboard
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-border/40">
              <div className="flex items-center space-x-2">
                <Image src="/fox-lawyer-logo.png" alt="Fox Lawyer" width={32} height={32} />
                <h1 className="text-xl font-bold text-foreground">Fox Lawyer</h1>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <nav className="flex flex-col space-y-6">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-lg font-medium text-foreground hover:text-emerald-400 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
              </nav>
            </div>
            <div className="p-6 border-t border-border/40">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-white font-medium bg-transparent"
                onClick={() => {
                  router.push("/dashboard")
                  setMobileMenuOpen(false)
                }}
              >
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section
        id="inicio"
        className="relative py-24 px-4 overflow-hidden"
        style={{
          backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/git-blob/prj_mYDYHUeBJSsmIli1t7KwnGvlkcwc/jZee6Fk2JGSsZxFe5hNqnV/public/hero-background.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay for blur and darkening */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Mobile Logo - Only visible on mobile devices */}
            <div className="md:hidden mb-8">
              <Image src="/fox-lawyer-logo.png" alt="Fox Lawyer" width={80} height={80} className="mx-auto" />
            </div>

            {/* Announcement Banner */}
            <div className="inline-flex items-center space-x-2 bg-card border border-border/40 rounded-full px-4 py-2 mb-8">
              <span className="text-sm text-muted-foreground">Asesoría Personalizada</span>
              <Button variant="link" className="text-sm p-0 h-auto text-emerald-400 hover:text-emerald-300">
                Toma la encuesta <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Transforma tus problemas en <span className="text-emerald-400">oportunidades</span>
            </h1>

            <p className="text-xl text-gray-200 mb-8 leading-relaxed max-w-3xl mx-auto">
              Fox Lawyer es la plataforma de asesoría personalizada donde se previenen o se resuelven todo tipo de
              problemas individuales luego de un análisis extremadamente detallado por expertos protegiendo siempre la
              privacidad y confidencialidad del cliente
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                Comienza tu transformación
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-emerald-500/50 text-emerald-400 bg-transparent hover:bg-emerald-500 hover:text-white"
              >
                Solicita una demo
              </Button>
            </div>

            {/* Trusted by section */}
            <div className="space-y-4">
              <div className="flex justify-center items-center space-x-8 md:space-x-12">
                <Globe className="w-8 h-8 company-icon cursor-pointer text-gray-300" />
                <Smartphone className="w-8 h-8 company-icon cursor-pointer text-gray-300" />
                <Laptop className="w-8 h-8 company-icon cursor-pointer text-gray-300" />
                <Database className="w-8 h-8 company-icon cursor-pointer text-gray-300" />
                <Lock className="w-8 h-8 company-icon cursor-pointer text-gray-300" />
              </div>
              <p className="text-sm text-gray-300">Confiado por empresas de rápido crecimiento en todo el mundo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Horizontal Scroll */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Nuestras Especialidades</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Descubre las áreas en las que podemos ayudarte a transformar tu vida.
            </p>
          </div>

          <div className="relative overflow-hidden">
            <div className="flex space-x-6 animate-scroll">
              {duplicatedFeatures.map((feature, index) => (
                <Card
                  key={index}
                  className="flex-shrink-0 w-80 feature-card border-border/40 bg-card/50 cursor-pointer"
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center">
                        <Image src={feature.icon || "/placeholder.svg"} alt={feature.title} width={24} height={24} />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                    <CardDescription className="text-base text-muted-foreground">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>{/* Removed specific details and features list as per new design */}</CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="proceso" className="py-24 px-4 bg-card/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Proceso de Transformación</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tres pasos simples hacia tu crecimiento personal y financiero
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Suscripción</h3>
                <p className="text-muted-foreground mb-6">Únete a nuestra plataforma por solo $50 USD mensuales</p>
                <Card className="border-emerald-500/20 bg-emerald-500/5">
                  <CardContent className="p-4">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Para el asesor:</span>
                        <span className="font-semibold text-emerald-400">$25</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Para la plataforma:</span>
                        <span className="font-semibold text-emerald-400">$25</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Evaluación</h3>
                <p className="text-muted-foreground mb-6">
                  Completa un cuestionario personalizado según tu situación específica
                </p>
                <Card className="border-blue-500/20 bg-blue-500/5">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">
                      Análisis detallado de tu situación actual y objetivos
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Plan de Acción</h3>
                <p className="text-muted-foreground mb-6">
                  Recibe un plan personalizado con pasos específicos y seguimiento
                </p>
                <Card className="border-purple-500/20 bg-purple-500/5">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Estrategias personalizadas con métricas de progreso</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compensation Plan */}
      <section id="compensacion" className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Genera Ingresos Ayudando a Otros</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Únete a nuestra red de asesores y construye un negocio sostenible
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center text-emerald-400">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Estructura de Comisiones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                    <h4 className="font-semibold text-emerald-400 mb-2">Comisión Directa - 50%</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      $25 USD por cada cliente que refiere directamente
                    </p>
                    <div className="flex items-center text-xs text-emerald-400">
                      <BarChart3 className="w-3 h-3 mr-1" />
                      Pago inmediato al confirmar suscripción
                    </div>
                  </div>

                  <div className="p-4 h-80 rounded-lg border border-purple-500/20 bg-purple-500/5">
                    <h4 className="font-semibold text-purple-400 mb-2">Bonos de Liderazgo</h4>
                    <p className="text-sm text-muted-foreground mb-2">Incentivos adicionales por volumen y mentorías</p>
                    <div className="flex items-center text-xs text-purple-400">
                      <Award className="w-3 h-3 mr-1" />
                      Hasta $500 USD adicionales mensuales
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 mt-2">
                      ¡Potencia tu impacto y multiplica tus ingresos con nuestro programa Bonos de Liderazgo ! Diseñado
                      para aquellos que no solo destacan por su desempeño individual.
                    </p>

                    <div className="flex items-center text-xs text-purple-400">
                      <MessageCircleQuestion className="w-3 h-3 mr-1" />
                      ¿Qué ofrece?
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-2 ml-2">
                      <CircleDashed className="w-3 h-3 mr-1 text-purple-400" />
                      Bonos por volumen
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-2 ml-2">
                      <CircleDashed className="w-3 h-3 mr-1 text-purple-400" />
                      Bonos por mentoría
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-2 ml-2">
                      <CircleDashed className="w-3 h-3 mr-1 text-purple-400" />
                      Reconocimiento mensual
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-emerald-400">Calculadora de Ingresos</CardTitle>
                <CardDescription>Proyecta tus ganancias mensuales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="referrals" className="text-sm font-medium">
                    Referidos directos por mes
                  </Label>
                  <Input
                    id="referrals"
                    type="number"
                    value={referrals}
                    onChange={(e) => handleReferralChange(e.target.value)}
                    min="0"
                    className="mt-2"
                  />
                </div>

                <Separator />

                <div className="p-6 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Ingresos mensuales estimados</p>
                    <p className="text-4xl font-bold text-emerald-400">${monthlyEarnings.toLocaleString()} USD</p>
                    <p className="text-xs text-muted-foreground">Basado en {referrals} referidos directos</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>• Cálculos incluyen comisiones directas</p>
                  <p>• Resultados pueden variar según desempeño</p>
                  <p>• No incluye bonos de liderazgo adicionales</p>
                </div>

                <Button className="w-full bg-emerald-500 hover:bg-emerald-600">Comenzar como Asesor</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Subscription Plans Section */}
      <section id="planes" className="py-24 px-4 bg-card/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Nuestros Planes de Suscripción</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Elige el plan que mejor se adapte a tus necesidades y comienza tu transformación.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="max-w-2xl mx-auto mb-8">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`border-border/40 ${
                  plan.highlight ? "border-emerald-500 ring-2 ring-emerald-500" : ""
                } bg-card/50 hover:bg-card/80 transition-colors flex flex-col`}
              >
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-foreground">{plan.name}</CardTitle>
                  <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between p-6 pt-0">
                  <div className="text-center mb-6">
                    <p className="text-5xl font-bold text-foreground">
                      {plan.price}
                      <span className="text-lg text-muted-foreground">/{plan.frequency}</span>
                    </p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      plan.highlight
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                        : "bg-muted-foreground hover:bg-muted-foreground/80 text-white"
                    }`}
                    size="lg"
                    onClick={() => handlePlanSelection(plan.id)}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      plan.buttonText
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {!user && (
            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <Button variant="link" className="p-0 h-auto text-emerald-400" onClick={() => router.push("/register")}>
                  Regístrate aquí
                </Button>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Framework Integration Section */}
      <section className="py-24 px-4 bg-card/20">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-muted-foreground mb-4">
              Úsalo con cualquier enfoque.{" "}
              <span className="text-emerald-400">Los mejores productos integrados como plataforma.</span>
            </p>

            <h2 className="text-4xl font-bold text-foreground mb-16">
              Usa Fox Lawyer con <span className="text-emerald-400">cualquier metodología</span>
            </h2>

            <div className="flex justify-center items-center space-x-8 md:space-x-12 opacity-60 mb-16">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <p className="text-sm text-muted-foreground">HISTORIAS DE CLIENTES</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section with Spotlight Effect */}
      <section className="py-24 px-4 spotlight-bg relative overflow-hidden">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Únete a la comunidad</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Descubre lo que nuestra comunidad tiene que decir sobre su experiencia con Fox Lawyer.
            </p>

            <div className="flex justify-center space-x-4 mb-12">
              <Button variant="outline" size="sm" className="border-border/40 bg-transparent">
                <MessageCircle className="w-4 h-4 mr-2" />
                Discusiones GitHub
              </Button>
              <Button variant="outline" size="sm" className="border-border/40 bg-transparent">
                Discord
              </Button>
            </div>
          </div>

          {/* Infinite Scrolling Testimonials */}
          <div className="relative">
            <div className="flex space-x-6 animate-scroll">
              {duplicatedTestimonials.map((testimonial, index) => (
                <Card
                  key={index}
                  className="flex-shrink-0 w-80 border-border/40 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium">{testimonial.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-foreground truncate">{testimonial.name}</p>
                          {testimonial.verified && <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{testimonial.username}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{testimonial.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="text-center mt-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Transforma tu vida en un fin de semana, <span className="text-emerald-400">escala a millones</span>
            </h3>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contacto" className="py-24 px-4 bg-card/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Comienza Tu Transformación</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Únete a miles de personas que ya han transformado sus vidas
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-center text-emerald-400">Formulario de Contacto</CardTitle>
                <CardDescription className="text-center">
                  Completa el formulario y nos pondremos en contacto contigo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form ref={contactFormRef} onSubmit={handleContactFormSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input id="firstName" name="firstName" placeholder="Tu nombre" className="mt-1" />
                      {formState.errors?.firstName && (
                        <p className="text-red-500 text-sm mt-1">{formState.errors.firstName[0]}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Apellido</Label>
                      <Input id="lastName" name="lastName" placeholder="Tu apellido" className="mt-1" />
                      {formState.errors?.lastName && (
                        <p className="text-red-500 text-sm mt-1">{formState.errors.lastName[0]}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input id="email" name="email" type="email" placeholder="tu@ejemplo.com" className="mt-1" />
                    {formState.errors?.email && (
                      <p className="text-red-500 text-sm mt-1">{formState.errors.email[0]}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Teléfono (opcional)</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="+52 123 456 7890" className="mt-1" />
                    {formState.errors?.phone && (
                      <p className="text-red-500 text-sm mt-1">{formState.errors.phone[0]}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="message">Mensaje</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Cuéntanos sobre tu situación y objetivos..."
                      rows={4}
                      className="mt-1"
                    />
                    {formState.errors?.message && (
                      <p className="text-red-500 text-sm mt-1">{formState.errors.message[0]}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="file">Subir Documento (opcional)</Label>
                    <div className="mt-1">
                      <Input
                        id="file"
                        name="file"
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-dashed"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {selectedFile ? selectedFile.name : "Seleccionar archivo"}
                      </Button>
                      {formState.errors?.file && (
                        <p className="text-red-500 text-sm mt-1">{formState.errors.file[0]}</p>
                      )}
                      {filePreviewUrl && (
                        <div className="mt-2 flex items-center space-x-2">
                          {selectedFile?.type.startsWith("image/") ? (
                            <Image
                              src={filePreviewUrl || "/placeholder.svg"}
                              alt="File preview"
                              width={64}
                              height={64}
                              className="rounded-md object-cover"
                            />
                          ) : (
                            <File className="h-16 w-16 text-muted-foreground" />
                          )}
                          <span className="text-sm text-muted-foreground">{selectedFile?.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <SubmitButton isPending={isPending} />
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <Image src="/fox-lawyer-logo.png" alt="Fox Lawyer" width={24} height={24} />
                <h4 className="text-lg font-bold text-foreground">Fox Lawyer</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Transformando vidas a través de asesoría legal personalizada y profesional.
              </p>
            </div>

            <div>
              <h5 className="font-semibold mb-4 text-foreground">Servicios</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Asesoría Financiera
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Relaciones Familiares
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Relaciones Amorosas
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Programa de Asesores
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4 text-foreground">Contacto</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>contacto@foxlawyer.com</li>
                <li>+52 123 456 7890</li>
                <li>Lun - Vie: 9:00 - 18:00</li>
                <li>Sáb: 9:00 - 14:00</li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4 text-foreground">Síguenos</h5>
              <div className="flex space-x-3">
                <Button size="sm" variant="outline" className="w-10 h-10 p-0 bg-transparent">
                  <FacebookIcon />
                </Button>
                <Button size="sm" variant="outline" className="w-10 h-10 p-0 bg-transparent">
                  <InstagramIcon />
                </Button>
                <Button size="sm" variant="outline" className="w-10 h-10 p-0 bg-transparent">
                  <TwitterIcon />
                </Button>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 Fox Lawyer. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  )
}
