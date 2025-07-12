"use client"
import { useState } from "react";
import { FinancialOverviewSection } from "../components/financial-overview-section";
import { useAuth } from "@/contexts/auth-context";
import { redirect } from "next/navigation";

export default function FinancialPage() {
  const { user } = useAuth(); // Reemplaza con la lógica para obtener el ID del usuario actual
    const [dateRange, setDateRange] = useState({
    start: "2024-01-01",
    end: "2024-12-31",
  })

  if(!user) {
    redirect("/login");
  }

    return (
        <div className="p-6">
           <FinancialOverviewSection advisorId={user.id} />
           
        </div>
    )
}