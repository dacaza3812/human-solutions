import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2 } from "lucide-react"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Image src="/fox-lawyer-logo.png" alt="Fox Lawyer Logo" width={40} height={40} className="dark:invert" />
          <span className="sr-only">Soluciones Humanas</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Características
          </Link>
          <Link href="#pricing" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Precios
          </Link>
          <Link href="#contact" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Contacto
          </Link>
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Iniciar Sesión
          </Link>
          <Link href="/register" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Registrarse
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 sm:py-24 md:py-32 lg:py-40 xl:py-48 bg-gradient-to-r from-emerald-500 to-green-600 text-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Soluciones Legales a tu Alcance
                  </h1>
                  <p className="max-w-[600px] text-gray-50 md:text-xl">
                    Simplifica la gestión de tus casos legales con nuestra plataforma intuitiva y segura.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="/register"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-emerald-600 shadow transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Regístrate Gratis
                  </Link>
                  <Link
                    href="#features"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-white bg-transparent px-8 text-sm font-medium shadow-sm transition-colors hover:bg-white hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Saber Más
                  </Link>
                </div>
              </div>
              <Image
                src="/supabase-hero.png"
                width="600"
                height="400"
                alt="Hero"
                className="mx-auto aspect-[3/2] overflow-hidden rounded-xl object-cover lg:order-last lg:aspect-[4/3]"
              />
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Características Clave</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Nuestra plataforma ofrece un conjunto completo de herramientas para optimizar tu práctica legal.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-10">
              <Image
                src="/supabase-features.png"
                width="550"
                height="310"
                alt="Features"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              />
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-6">
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Gestión de Casos</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Organiza y rastrea todos tus casos con facilidad, desde la admisión hasta la resolución.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Comunicación Segura</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Comunícate con tus clientes y colegas de forma segura dentro de la plataforma.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Automatización de Documentos</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Genera documentos legales automáticamente con plantillas personalizables.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Planes de Precios Flexibles
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Elige el plan que mejor se adapte a tus necesidades, con opciones para profesionales individuales y
                firmas.
              </p>
            </div>
            <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle>Básico</CardTitle>
                  <CardDescription>Ideal para profesionales individuales.</CardDescription>
                  <div className="text-4xl font-bold">
                    $29<span className="text-base font-normal">/mes</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-left">
                    <li className="flex items-center">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-500" />
                      Gestión de 10 casos
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-500" />
                      Soporte por correo electrónico
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-500" />
                      Almacenamiento de 1GB
                    </li>
                  </ul>
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600">Elegir Plan Básico</Button>
                </CardContent>
              </Card>
              <Card className="flex flex-col justify-between border-2 border-emerald-500">
                <CardHeader>
                  <CardTitle>Estándar</CardTitle>
                  <CardDescription>Perfecto para pequeñas firmas.</CardDescription>
                  <div className="text-4xl font-bold">
                    $79<span className="text-base font-normal">/mes</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-left">
                    <li className="flex items-center">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-500" />
                      Gestión de casos ilimitados
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-500" />
                      Soporte prioritario
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-500" />
                      Almacenamiento de 10GB
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-500" />
                      Acceso a plantillas premium
                    </li>
                  </ul>
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600">Elegir Plan Estándar</Button>
                </CardContent>
              </Card>
              <Card className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle>Premium</CardTitle>
                  <CardDescription>Para firmas grandes y equipos.</CardDescription>
                  <div className="text-4xl font-bold">
                    $199<span className="text-base font-normal">/mes</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-left">
                    <li className="flex items-center">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-500" />
                      Todas las características de Estándar
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-500" />
                      Soporte 24/7
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-500" />
                      Almacenamiento ilimitado
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-500" />
                      Integraciones personalizadas
                    </li>
                  </ul>
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600">Elegir Plan Premium</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Lo que dicen nuestros clientes</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Historias de éxito de profesionales legales que confían en Soluciones Humanas.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-10">
              <Image
                src="/supabase-testimonials.png"
                width="550"
                height="310"
                alt="Testimonials"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              />
              <div className="flex flex-col justify-center space-y-4">
                <div className="grid gap-4">
                  <blockquote className="text-lg font-semibold leading-snug lg:text-xl lg:leading-normal">
                    &ldquo;Soluciones Humanas ha transformado la forma en que gestiono mi práctica. Es intuitiva, segura
                    y me ha ahorrado incontables horas.&rdquo;
                  </blockquote>
                  <div>
                    <div className="font-semibold">Ana García</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Abogada Independiente</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="contact" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Contáctanos</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  ¿Tienes preguntas o quieres saber más? Envíanos un mensaje.
                </p>
              </div>
              <div className="w-full max-w-md space-y-2">
                <form className="flex flex-col gap-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" placeholder="Tu nombre" required type="text" />
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" placeholder="tu@ejemplo.com" required type="email" />
                  <Label htmlFor="message">Mensaje</Label>
                  <Input id="message" placeholder="Tu mensaje" required type="textarea" className="min-h-[100px]" />
                  <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">
                    Enviar Mensaje
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          &copy; 2024 Soluciones Humanas. Todos los derechos reservados.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Términos de Servicio
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Política de Privacidad
          </Link>
        </nav>
      </footer>
    </div>
  )
}
