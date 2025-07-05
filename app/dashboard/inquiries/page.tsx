"use client"
import InquiriesSectionComponent from "../components/inquiries-section"
import InquiriesLoading from "./loading"
import { Suspense } from "react"

interface Inquiry {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  message: string
  file_url?: string
  status: "new" | "in_progress" | "resolved" | "archived"
  created_at: string
}

export default function InquiriesPage() {
  return (
    <div className="grid gap-6 p-6 md:p-8">
      <h1 className="text-3xl font-bold">Consultas de Clientes</h1>
      <Suspense fallback={<InquiriesLoading />}>
        <InquiriesSectionComponent />
      </Suspense>
    </div>
  )
}
