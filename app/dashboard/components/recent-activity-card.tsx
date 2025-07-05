"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

interface RecentActivityCardProps {
  recentActivity: {
    id: number
    type: string
    description: string
    time: string
    status: "success" | "completed" | "payment" | "scheduled"
  }[]
}

export function RecentActivityCard({ recentActivity }: RecentActivityCardProps) {
  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <TrendingUp className="w-5 h-5 mr-2 text-emerald-400" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentActivity.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border border-border/40">
            <div
              className={`w-2 h-2 rounded-full mt-2 ${
                activity.status === "success"
                  ? "bg-emerald-400"
                  : activity.status === "completed"
                    ? "bg-blue-400"
                    : activity.status === "payment"
                      ? "bg-purple-400"
                      : "bg-orange-400"
              }`}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{activity.type}</p>
              <p className="text-xs text-muted-foreground">{activity.description}</p>
              <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
