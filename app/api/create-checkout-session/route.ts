import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

import prismadb from "@/lib/prismadb"
import { stripe } from "@/lib/stripe"

const DAY_IN_MS = 86_400_000

export async function POST(req: Request) {
  try {
    const { userId } = auth()
    const { planId } = await req.json()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    if (!planId) {
      return new NextResponse("Plan ID is required", { status: 400 })
    }

    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        userId: userId,
      },
    })

    if (userSubscription && userSubscription.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://foxlawyer.vercel.app"}/settings`,
      })

      return NextResponse.json({ url: stripeSession.url })
    }

    const plan = await prismadb.plan.findUnique({
      where: {
        id: planId,
      },
    })

    if (!plan) {
      return new NextResponse("Plan not found", { status: 404 })
    }

    const customer = await prismadb.user.findUnique({
      where: {
        userId: userId,
      },
    })

    if (!customer) {
      return new NextResponse("Customer not found", { status: 404 })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: Math.round(plan.price * 100),
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://foxlawyer.vercel.app"}/success?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://foxlawyer.vercel.app"}/#planes`,
      metadata: {
        userId,
        planId: planId.toString(),
        planName: plan.name, // Añadir el nombre del plan
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.log("[STRIPE_ERROR]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
