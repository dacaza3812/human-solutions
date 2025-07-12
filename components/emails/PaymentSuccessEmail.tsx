import { Html, Body, Container, Heading, Text, Button } from "@react-email/components"
import * as React from "react"

interface PaymentSuccessEmailProps {
  firstName: string
  planName: string
}

export default function PaymentSuccessEmail({ firstName, planName }: PaymentSuccessEmailProps) {
  return (
    <Html>
      <Body>
        <Container>
          <Heading>¡Hola, {firstName}!</Heading>
          <Text>Tu pago del plan <strong>{planName}</strong> ha sido procesado correctamente. Gracias por confiar en nosotros.</Text>
          <Button href={`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions`}>
            Ver mis suscripciones
          </Button>
        </Container>
      </Body>
    </Html>
  )
}
