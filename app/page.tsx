import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ContactForm } from "@/components/contact-form" // Import the new ContactForm component
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarIcon } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Image src="/fox-lawyer-logo.png" alt="Fox Lawyer Logo" width={40} height={40} className="mr-2" />
          <span className="sr-only">Fox Lawyer</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Características
          </Link>
          <Link href="#services" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Servicios
          </Link>
          <Link
            href="#testimonials"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            Testimonios
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
        <section className="relative w-full pt-12 md:pt-24 lg:pt-32 xl:pt-48 flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
          <Image
            src="/placeholder.jpg?height=1080&width=1920&query=legal%20firm%20office%20background"
            alt="Background"
            layout="fill"
            objectFit="cover"
            quality={100}
            className="absolute inset-0 -z-10"
          />
          <div className="px-4 md:px-6 text-center relative z-10 bg-background/70 p-8 rounded-lg max-w-3xl mx-auto">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                Soluciones Legales Humanas y Accesibles
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                En Fox Lawyer, combinamos experiencia legal con un enfoque humano para ofrecerte la mejor asesoría.
              </p>
              <div className="space-x-4">
                <Link href="/register" prefetch={false}>
                  <Button className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                    Comenzar Ahora
                  </Button>
                </Link>
                <Link href="#contact" prefetch={false}>
                  <Button
                    variant="outline"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    Contáctanos
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Nuestras Características Destacadas</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Descubre cómo Fox Lawyer te facilita el acceso a la justicia.
                </p>
              </div>
            </div>
            <div className="relative w-full overflow-hidden py-12">
              <Carousel
                opts={{
                  align: "start",
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <Card>
                      <CardHeader>
                        <CardTitle>Asesoría Personalizada</CardTitle>
                      </CardHeader>
                      <CardContent>
                        Recibe atención individualizada de abogados expertos en diversas áreas del derecho.
                      </CardContent>
                    </Card>
                  </CarouselItem>
                  <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <Card>
                      <CardHeader>
                        <CardTitle>Planes Flexibles</CardTitle>
                      </CardHeader>
                      <CardContent>
                        Elige el plan que mejor se adapte a tus necesidades y presupuesto, sin sorpresas.
                      </CardContent>
                    </Card>
                  </CarouselItem>
                  <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <Card>
                      <CardHeader>
                        <CardTitle>Acceso 24/7</CardTitle>
                      </CardHeader>
                      <CardContent>
                        Consulta tu caso y comunícate con tu asesor en cualquier momento y desde cualquier lugar.
                      </CardContent>
                    </Card>
                  </CarouselItem>
                  <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <Card>
                      <CardHeader>
                        <CardTitle>Transparencia Total</CardTitle>
                      </CardHeader>
                      <CardContent>
                        Mantente informado sobre el progreso de tu caso con actualizaciones en tiempo real.
                      </CardContent>
                    </Card>
                  </CarouselItem>
                  <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <Card>
                      <CardHeader>
                        <CardTitle>Seguridad de Datos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        Tu información personal y legal está protegida con los más altos estándares de seguridad.
                      </CardContent>
                    </Card>
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </div>
        </section>

        <section id="services" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Nuestros Servicios Legales</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Ofrecemos una amplia gama de servicios para cubrir todas tus necesidades legales.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Derecho Familiar</CardTitle>
                </CardHeader>
                <CardContent>Asesoría en divorcios, pensiones alimenticias, custodias y más.</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Derecho Laboral</CardTitle>
                </CardHeader>
                <CardContent>Defensa de tus derechos como trabajador o empleador.</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Derecho Civil</CardTitle>
                </CardHeader>
                <CardContent>Contratos, propiedades, herencias y disputas entre particulares.</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Derecho Penal</CardTitle>
                </CardHeader>
                <CardContent>Representación en casos de delitos y faltas.</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Derecho Mercantil</CardTitle>
                </CardHeader>
                <CardContent>Asesoría a empresas, contratos comerciales y litigios.</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Derecho Administrativo</CardTitle>
                </CardHeader>
                <CardContent>Trámites y recursos ante la administración pública.</CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Lo que Dicen Nuestros Clientes</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Historias de éxito y satisfacción de quienes confiaron en Fox Lawyer.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 lg:grid-cols-2">
              <Card>
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <Avatar className="h-16 w-16 mb-4">
                    <AvatarImage src="/placeholder-user.jpg?height=64&width=64&query=happy%20client" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <p className="text-lg font-semibold">
                    "El equipo de Fox Lawyer fue increíblemente profesional y me ayudó a resolver mi caso de manera
                    eficiente. ¡Altamente recomendados!"
                  </p>
                  <div className="flex items-center mt-4">
                    <StarIcon className="w-5 h-5 fill-primary" />
                    <StarIcon className="w-5 h-5 fill-primary" />
                    <StarIcon className="w-5 h-5 fill-primary" />
                    <StarIcon className="w-5 h-5 fill-primary" />
                    <StarIcon className="w-5 h-5 fill-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">- Juan Pérez</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <Avatar className="h-16 w-16 mb-4">
                    <AvatarImage src="/placeholder-user.jpg?height=64&width=64&query=satisfied%20client" />
                    <AvatarFallback>AM</AvatarFallback>
                  </Avatar>
                  <p className="text-lg font-semibold">
                    "Su enfoque humano y su dedicación hicieron toda la diferencia. Me sentí apoyado en cada paso del
                    proceso."
                  </p>
                  <div className="flex items-center mt-4">
                    <StarIcon className="w-5 h-5 fill-primary" />
                    <StarIcon className="w-5 h-5 fill-primary" />
                    <StarIcon className="w-5 h-5 fill-primary" />
                    <StarIcon className="w-5 h-5 fill-primary" />
                    <StarIcon className="w-5 h-5 fill-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">- Ana Martínez</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="contact" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Contáctanos</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  ¿Tienes alguna pregunta o necesitas asesoría legal? Envíanos un mensaje.
                </p>
              </div>
            </div>
            <div className="mx-auto w-full max-w-md py-12">
              <ContactForm /> {/* Use the new ContactForm component */}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Fox Lawyer. Todos los derechos reservados.</p>
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
