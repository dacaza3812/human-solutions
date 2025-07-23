"use server"

import { revalidatePath } from "next/cache"
import { updateInquiryStatus } from "./inquiries"

interface Inquiry {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  message: string
  file_url: string | null
  status: "new" | "in_progress" | "resolved" | "archived"
  created_at: string
}

export const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    
    await updateInquiryStatus(inquiryId, newStatus as Inquiry["status"])
    revalidatePath("/dashboard/inquiries")
  }
