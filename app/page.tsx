"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { siteConfig } from "@/config/site"
import { Icons } from "@/components/icons"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { submitContactForm } from "@/actions/contact"

interface Feature {
  title: string
  description: string
  details: string
  features: string[]
  icon?: string
}

interface FAQItem {
  question: string
  answer: string
}

const features: Feature[] = [
  {
    title: "Asesoría Financiera Personalizada",
    description: "Planificación y gestión de tus finanzas para alcanzar tus metas.",
    details:
      "Desde la creación de presupuestos hasta la inversión estratégica, te ayudamos a tomar decisiones financieras informadas.",
    features: ["Análisis de ingresos y gastos", "Planificación de jubilación", "Inversiones personalizadas"],
    icon: "/icons/financial.svg",
  },
  {
    title: "Relaciones Familiares Saludables",
    description: "Mejora la comunicación y fortalece los lazos familiares.",
    details: "Ofrecemos herramientas y técnicas para resolver conflictos y fomentar un ambiente familiar positivo.",
    features: ["Terapia familiar", "Talleres de comunicación", "Resolución de conflictos"],
    icon: "/icons/family.svg",
  },
  {
    title: "Asesoría Legal Integral",
    description: "Protege tus derechos y asegura el cumplimiento de la ley.",
    details: "Nuestros expertos legales te brindan asesoramiento en diversas áreas, desde contratos hasta litigios.",
    features: ["Revisión de contratos", "Representación legal", "Asesoramiento en derecho civil"],
    icon: "/icons/legal.svg",
  },
  {
    title: "Desarrollo Personal y Profesional",
    description: "Alcanza tu máximo potencial y logra tus objetivos.",
    details:
      "A través de programas de coaching y mentoría, te impulsamos a crecer tanto en el ámbito personal como profesional.",
    features: ["Coaching personalizado", "Desarrollo de liderazgo", "Gestión del tiempo"],
    icon: "/icons/personal.svg",
  },
]

const faqs: FAQItem[] = [
  {
    question: "¿Cómo puedo solicitar una consulta?",
    answer:
      "Puedes solicitar una consulta a través de nuestro formulario de contacto o llamando a nuestro número de teléfono.",
  },
  {
    question: "¿Qué tipo de servicios ofrecen?",
    answer:
      "Ofrecemos una amplia gama de servicios, desde asesoría financiera hasta terapia familiar y asesoría legal.",
  },
  {
    question: "¿Cuál es su política de privacidad?",
    answer:
      "Respetamos tu privacidad y protegemos tus datos personales. Consulta nuestra política de privacidad para obtener más información.",
  },
  {
    question: "¿Cómo puedo cancelar mi suscripción?",
    answer:
      "Puedes cancelar tu suscripción en cualquier momento a través de tu cuenta o contactando a nuestro equipo de soporte.",
  },
]

interface SubmitButtonProps {
  isPending: boolean
}

function SubmitButton({ isPending }: SubmitButtonProps) {
  return (
    <Button disabled={isPending}>
      {isPending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
      Enviar Mensaje
    </Button>
  )
}

export default function Home() {
  const contactFormRef = useRef<HTMLFormElement>(null)
  const duplicatedFeatures = [...features, ...features]

  const [isPending, setIsPending] = useState(false)
  const [formState, setFormState] = useState({
    success: false,
    message: "",
    errors: {},
  })

  const handleContactFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault() // Prevent default form submission
    setIsPending(true)
    const formData = new FormData(event.currentTarget)
    const result = await submitContactForm(formState, formData) // Pass prevState as first argument
    setFormState(result)
    setIsPending(false)
  }

  return (
    <>
      <section
        id="inicio"
        className="relative py-24 px-4 overflow-hidden"
        style={{
          backgroundImage: `url('/hero-background.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay for blur and darkening */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-5xl font-bold text-white mb-8">Soluciones Humanas Integrales</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            Acompañamiento profesional para el bienestar integral de las personas, las familias y las organizaciones.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="#contacto">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">Contáctanos</Button>
            </Link>
            <Link href="#servicios">
              <Button variant="outline" className="text-white bg-transparent">
                Nuestros Servicios
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section id="servicios" className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Nuestras Especialidades</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Descubre las áreas en las que podemos ayudarte a transformar tu vida.
            </p>
          </div>

          <div className="relative overflow-hidden">
            <div className="flex space-x-6 animate-scroll-features">
              {duplicatedFeatures.map((feature, index) => (
                <Card
                  key={index}
                  className="flex-shrink-0 w-80 feature-card border-border/40 bg-card/50 cursor-pointer"
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center">
                        <Image src={feature.icon || "/placeholder.png"} alt={feature.title} width={16} height={16} />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                    <CardDescription className="text-base text-muted-foreground">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{feature.details}</p>
                    <ul className="space-y-2">
                      {feature.features.map((item, idx) => (
                        <li key={idx} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="nosotros" className="py-24 px-4 bg-secondary">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-4">¿Quiénes Somos?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Somos un equipo de profesionales comprometidos con el bienestar integral de las personas, las familias y
                las organizaciones.
              </p>
              <p className="text-muted-foreground mb-4">
                Nuestra misión es brindar soluciones humanas integrales que permitan a nuestros clientes alcanzar su
                máximo potencial y vivir una vida plena y significativa.
              </p>
              <p className="text-muted-foreground">
                Contamos con una amplia experiencia en diversas áreas, desde asesoría financiera hasta terapia familiar
                y asesoría legal.
              </p>
            </div>
            <div className="relative">
              <Image
                src="/about-us.jpg"
                alt="Nuestro Equipo"
                width={500}
                height={300}
                className="rounded-lg shadow-md"
              />
              <div className="absolute bottom-0 right-0 bg-emerald-500 text-white py-2 px-4 rounded-tl-lg">
                Equipo Certificado
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Preguntas Frecuentes</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Respondemos a tus preguntas más comunes sobre nuestros servicios y cómo podemos ayudarte.
            </p>
          </div>

          <Accordion type="single" collapsible>
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section id="contacto" className="py-24 px-4 bg-secondary">
        <SolucionesHumanas
          contactFormRef={contactFormRef}
          isPending={isPending}
          formState={formState}
          handleContactFormSubmit={handleContactFormSubmit}
          SubmitButton={SubmitButton}
        />
      </section>

      <section className="py-12 px-4 bg-card">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.
          </p>
        </div>
      </section>
    </>
  )
}

interface SolucionesHumanasProps {
  contactFormRef: React.RefObject<HTMLFormElement>
  isPending: boolean
  formState: {
    success: boolean
    message: string
    errors: {}
  }
  handleContactFormSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  SubmitButton: ({ isPending }: SubmitButtonProps) => JSX.Element
}

function SolucionesHumanas({
  contactFormRef,
  isPending,
  formState,
  handleContactFormSubmit,
  SubmitButton,
}: SolucionesHumanasProps) {
  return (
    <div className="container mx-auto">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-4xl font-bold text-foreground mb-4">Contáctanos</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Estamos aquí para ayudarte. Envíanos un mensaje y nos pondremos en contacto contigo lo antes posible.
          </p>
          {formState.success && (
            <Badge variant="success" className="mb-4">
              {formState.message}
            </Badge>
          )}
          {formState.message && !formState.success && (
            <Badge variant="destructive" className="mb-4">
              {formState.message}
            </Badge>
          )}
          <form ref={contactFormRef} onSubmit={handleContactFormSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" type="text" placeholder="Tu nombre" />
              {formState.errors.name && <p className="text-red-500 text-sm mt-1">{formState.errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" name="email" type="email" placeholder="Tu correo electrónico" />
              {formState.errors.email && <p className="text-red-500 text-sm mt-1">{formState.errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" name="phone" type="tel" placeholder="Tu número de teléfono" />
              {formState.errors.phone && <p className="text-red-500 text-sm mt-1">{formState.errors.phone}</p>}
            </div>
            <div>
              <Label htmlFor="message">Mensaje</Label>
              <Textarea id="message" name="message" placeholder="Escribe tu mensaje aquí" />
              {formState.errors.message && <p className="text-red-500 text-sm mt-1">{formState.errors.message}</p>}
            </div>

            <div>
              <Label htmlFor="file">Adjuntar Archivo (Opcional)</Label>
              <Input id="file" name="file" type="file" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <SubmitButton isPending={isPending} />
            </div>
          </form>
        </div>
        <div className="relative">
          <Image src="/contact-us.jpg" alt="Contáctanos" width={500} height={400} className="rounded-lg shadow-md" />
        </div>
      </div>
    </div>
  )
}
