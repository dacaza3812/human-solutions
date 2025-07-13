import { Html, Head, Body, Container, Heading, Text, Button } from "@react-email/components"
import React from "react"

interface PaymentSuccessEmailProps {
  firstName: string
  planName: string
}

export default function PaymentSuccessEmail({ firstName, planName }: PaymentSuccessEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#f9f9f9", margin: 0, fontFamily: "Arial, sans-serif" }}>
        <Container
          style={{
            padding: "20px",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            maxWidth: "600px",
            margin: "40px auto",
          }}
        >
          <Heading style={{ fontSize: "24px", marginBottom: "16px" }}>¡Hola, {firstName}!</Heading>

          <Text style={{ fontSize: "16px", marginBottom: "12px" }}>
            Tu pago del plan <strong>{planName}</strong> ha sido procesado correctamente. Gracias por confiar en nosotros.
          </Text>

          <Button
            href={`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions`}
            style={{
              display: "inline-block",
              padding: "12px 24px",
              backgroundColor: "#10b981",
              color: "#ffffff",
              textDecoration: "none",
              borderRadius: "4px",
              fontWeight: "bold",
              marginBottom: "16px",
            }}
          >
            Ver mis suscripciones
          </Button>

          <Text style={{ fontSize: "16px", marginBottom: "12px" }}>
            Para empezar YA tu proceso personalizado haz clic en este botón:
          </Text>

          <Button
            href="https://wa.me/+17868781312"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              backgroundColor: "#25D366",
              color: "#ffffff",
              textDecoration: "none",
              borderRadius: "4px",
              fontWeight: "bold",
            }}
          >
            Contactar por WhatsApp
          </Button>
        </Container>

        <Container
          style={{
            textAlign: "center",
            fontSize: "12px",
            color: "#888888",
            marginTop: "20px",
          }}
        >
          <Text>© {new Date().getFullYear()} Fox Lawyer. Todos los derechos reservados.</Text>
        </Container>
      </Body>
    </Html>
  )
}