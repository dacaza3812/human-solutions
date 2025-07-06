"use client"
import { useState } from "react";
import { FinancialOverviewSection } from "../components/financial-overview-section";

export default function FinancialPage() {
    const [dateRange, setDateRange] = useState({
    start: "2024-01-01",
    end: "2024-12-31",
  })

    return (
        <div className="p-6">
           <FinancialOverviewSection 
            dateRange={dateRange} setDateRange={setDateRange}
           />
        </div>
    )
}