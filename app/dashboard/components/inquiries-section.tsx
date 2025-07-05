"use client"

interface Inquiry {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  service_area?: string
  priority?: "low" | "medium" | "high"
  message: string
  file_url?: string
  status: "new" | "in_progress" | "resolved" | "archived"
  created_at: string
}

export function InquiriesSection() {
  return null
}
