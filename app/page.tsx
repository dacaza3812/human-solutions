"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Calculator,
  Heart,
  DollarSign,
  Users,
  FileText,
  Calendar,
  Upload,
  CheckCircle,
  Star,
  Play,
  Menu,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function SolucionesHumanas() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [referrals, setReferrals] = useState(1)
  const [monthlyEarnings, setMonthlyEarnings] = useState(25)

  const calculateEarnings = (refs: number) => {
    const directCommission = refs * 25 // 50% de 50 pesos
    const indirectCommission = Math.floor(refs * 0.3) * 12.5 // 25% de referidos indirectos estimados
    return directCommission + indirectCommission
  }

  const handleReferralChange = (value: string) => {
    const refs = Number.parseInt(value) || 0
    setReferrals(refs)
    setMonthlyEarnings(calculateEarnings(refs))
  }

  const navigation = [
    { name: "Inicio", href: "#inicio" },
    { name: "Servicios", href: "#servicios" },
    { name: "Proceso", href: "#proceso" },
    { name: "Compensación", href: "#compensacion" },
    { name: "Contacto", href: "#contacto" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:via-[#0a0a0a] dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-green-100 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Soluciones Humanas</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-6 lg:space-x-8">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium text-sm lg:text-base"
                  >
                    {item.name}
                  </a>
                ))}
              </nav>

              <ThemeToggle />

              {/* Mobile Menu */}
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px]">
                  <div className="flex flex-col space-y-4 mt-8">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="text-lg font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="py-12 md:py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-white mb-6">
              Soluciones{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400">
                Humanas
              </span>
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed px-4">
              Asesoría personalizada para resolver problemas financieros, familiares y amorosos
            </p>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-8 border border-green-100 dark:border-gray-700 mx-4 md:mx-0">
              <p className="text-base md:text-lg text-gray-700 dark:text-gray-200 mb-6">
                Únete a nuestra red de asesores y transforma vidas mientras generas ingresos
              </p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg rounded-full shadow-lg hover:shadow-xl transition-all w-full md:w-auto"
              >
                Suscríbete y gana hasta un 50% de comisión por referidos
              </Button>
            </div>

            {/* Video Placeholder */}
            <div className="relative bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg mx-4 md:mx-0">
              <div className="aspect-video flex items-center justify-center bg-gradient-to-r from-green-100 to-blue-100 dark:from-gray-800 dark:to-gray-700">
                <div className="text-center">
                  <Play className="w-12 md:w-16 h-12 md:h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 font-medium text-sm md:text-base px-4">
                    Video explicativo - Conoce nuestra metodología
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-12 md:py-20 px-4 bg-white/50 dark:bg-gray-900/50">
        <div className="container mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">Nuestros Servicios</h3>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 px-4">
              Asesoría especializada en las áreas más importantes de tu vida
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <Card className="border-green-100 dark:border-green-800 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-green-700 dark:text-green-400">Asesoría Financiera</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600 dark:text-gray-300 text-base">
                  "Haz que tu salario alcance hasta el final del mes"
                  <br />
                  <br />
                  Planificación presupuestaria, estrategias de ahorro y optimización de gastos personalizadas.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-blue-100 dark:border-blue-800 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-blue-700 dark:text-blue-400">Relaciones Familiares</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600 dark:text-gray-300 text-base">
                  Fortalece los vínculos familiares y mejora la comunicación en el hogar.
                  <br />
                  <br />
                  Mediación de conflictos y estrategias de convivencia armoniosa.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-pink-100 dark:border-pink-800 hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-pink-700 dark:text-pink-400">Relaciones Amorosas</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600 dark:text-gray-300 text-base">
                  Construye relaciones sólidas y duraderas basadas en la comunicación efectiva.
                  <br />
                  <br />
                  Terapia de pareja y coaching en habilidades sociales.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="proceso" className="py-12 md:py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Proceso de Interacción
            </h3>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 px-4">
              Tres pasos simples hacia tu transformación
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Suscripción</h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">El cliente se suscribe por $50 pesos</p>
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-100 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    <strong>$25</strong> para el asesor
                    <br />
                    <strong>$25</strong> para la compañía
                  </p>
                </div>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Cuestionario</h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Recibe y completa un cuestionario personalizado según tu situación
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Evaluación detallada de tu situación actual
                  </p>
                </div>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Análisis y Consejos</h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Obtén un análisis detallado y consejos específicos para tu caso
                </p>
                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
                  <p className="text-sm text-purple-700 dark:text-purple-300">Plan de acción personalizado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compensation Plan */}
      <section id="compensacion" className="py-12 md:py-20 px-4 bg-white/50 dark:bg-gray-900/50">
        <div className="container mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">Plan de Compensación</h3>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 px-4">Genera ingresos ayudando a otros</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
            <div>
              <Card className="border-green-100 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-green-700 dark:text-green-400 flex items-center text-lg md:text-xl">
                    <Calculator className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                    Estructura de Comisiones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-bold text-green-800 dark:text-green-300 mb-2">Comisión Directa</h4>
                    <p className="text-green-700 dark:text-green-300">
                      <strong>50%</strong> por cada suscripción directa
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      $25 pesos por cada cliente que refiere
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Comisión Indirecta</h4>
                    <p className="text-blue-700 dark:text-blue-300">
                      <strong>25%</strong> por referidos de tus referidos
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      $12.50 pesos por cada referido indirecto
                    </p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
                    <h4 className="font-bold text-purple-800 dark:text-purple-300 mb-2">Bonos Adicionales</h4>
                    <p className="text-purple-700 dark:text-purple-300">Bonos por volumen y liderazgo</p>
                    <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                      Incentivos especiales por metas alcanzadas
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="border-blue-100 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-blue-700 dark:text-blue-400 text-lg md:text-xl">
                    Calculadora de Ganancias
                  </CardTitle>
                  <CardDescription className="dark:text-gray-300">Proyecta tus ingresos mensuales</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="referrals" className="text-sm md:text-base">
                      Número de referidos directos por mes
                    </Label>
                    <Input
                      id="referrals"
                      type="number"
                      value={referrals}
                      onChange={(e) => handleReferralChange(e.target.value)}
                      min="0"
                      className="mt-1"
                    />
                  </div>

                  <Separator />

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 md:p-6 rounded-lg border dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Ingresos mensuales estimados</p>
                      <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400">
                        ${monthlyEarnings.toLocaleString()} MXN
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Basado en {referrals} referidos directos + estimación de indirectos
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <p>• Cálculo incluye comisiones directas e indirectas estimadas</p>
                    <p>• Los resultados pueden variar según el desempeño real</p>
                    <p>• No incluye bonos adicionales por volumen</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">Testimonios</h3>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 px-4">
              Historias reales de transformación
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <Card className="border-green-100 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm md:text-base">
                  "Gracias a la asesoría financiera, logré que mi salario durara todo el mes. Ahora incluso puedo
                  ahorrar."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 dark:text-green-300 font-bold">M</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white text-sm md:text-base">María González</p>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Cliente desde hace 6 meses</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm md:text-base">
                  "La terapia familiar nos ayudó a mejorar la comunicación en casa. Ahora somos una familia más unida."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 dark:text-blue-300 font-bold">C</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white text-sm md:text-base">Carlos Rodríguez</p>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Cliente desde hace 1 año</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-pink-100 dark:border-pink-800 md:col-span-2 lg:col-span-1">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm md:text-base">
                  "Como asesora, he ayudado a más de 50 personas y genero ingresos extra que me dan tranquilidad
                  financiera."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-pink-100 dark:bg-pink-800 rounded-full flex items-center justify-center mr-3">
                    <span className="text-pink-600 dark:text-pink-300 font-bold">A</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white text-sm md:text-base">Ana Martínez</p>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Asesora certificada</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contacto" className="py-12 md:py-20 px-4 bg-white/50 dark:bg-gray-900/50">
        <div className="container mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">Contacto</h3>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 px-4">Comienza tu transformación hoy</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="border-green-100 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-center text-green-700 dark:text-green-400 text-lg md:text-xl">
                  Formulario de Contacto
                </CardTitle>
                <CardDescription className="text-center dark:text-gray-300">
                  Completa el formulario y nos pondremos en contacto contigo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input id="firstName" placeholder="Tu nombre" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input id="lastName" placeholder="Tu apellido" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" placeholder="tu@email.com" />
                </div>

                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" type="tel" placeholder="+52 123 456 7890" />
                </div>

                <div>
                  <Label htmlFor="service">Servicio de Interés</Label>
                  <select className="w-full p-2 border border-input bg-background rounded-md text-sm">
                    <option value="">Selecciona un servicio</option>
                    <option value="financial">Asesoría Financiera</option>
                    <option value="family">Relaciones Familiares</option>
                    <option value="love">Relaciones Amorosas</option>
                    <option value="advisor">Quiero ser Asesor</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea id="message" placeholder="Cuéntanos sobre tu situación..." rows={4} />
                </div>

                <div>
                  <Label htmlFor="file">Subir Cuestionario (opcional)</Label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Input id="file" type="file" className="hidden" />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("file")?.click()}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Seleccionar archivo
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                    Enviar Mensaje
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar Consulta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-[#0a0a0a] text-white py-8 md:py-12 px-4 border-t border-gray-700 dark:border-gray-800">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="md:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-lg md:text-xl font-bold">Soluciones Humanas</h4>
              </div>
              <p className="text-gray-400 text-sm md:text-base">
                Transformando vidas a través de asesoría personalizada y humana.
              </p>
            </div>

            <div>
              <h5 className="font-bold mb-4 text-base md:text-lg">Servicios</h5>
              <ul className="space-y-2 text-gray-400 text-sm md:text-base">
                <li>Asesoría Financiera</li>
                <li>Relaciones Familiares</li>
                <li>Relaciones Amorosas</li>
                <li>Programa de Asesores</li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold mb-4 text-base md:text-lg">Contacto</h5>
              <ul className="space-y-2 text-gray-400 text-sm md:text-base">
                <li>contacto@solucioneshumanas.com</li>
                <li>+52 123 456 7890</li>
                <li>Lun - Vie: 9:00 - 18:00</li>
                <li>Sáb: 9:00 - 14:00</li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold mb-4 text-base md:text-lg">Síguenos</h5>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-700 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                  <span className="text-sm">FB</span>
                </div>
                <div className="w-10 h-10 bg-gray-700 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm">IG</span>
                </div>
                <div className="w-10 h-10 bg-gray-700 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                  <span className="text-sm">WA</span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6 md:my-8 bg-gray-700 dark:bg-gray-800" />

          <div className="text-center text-gray-400 text-sm md:text-base">
            <p>&copy; 2024 Soluciones Humanas. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
