"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import type { ChartConfig as ChartConfigType, ChartContainerProps } from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { Chart as RechartsChart, type ChartProps as RechartsChartProps, ResponsiveContainer } from "recharts"

const ChartContext = React.createContext<ChartConfigType | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className, children, config, ...props }, ref) => {
    const id = React.useId()
    return (
      <ChartContext.Provider value={config}>
        <div
          ref={ref}
          className={cn("flex h-[350px] w-full flex-col items-center justify-center", className)}
          {...props}
        >
          <ChartIdProvider value={id}>{children}</ChartIdProvider>
        </div>
      </ChartContext.Provider>
    )
  },
)
ChartContainer.displayName = "ChartContainer"

const ChartIdContext = React.createContext<string | null>(null)

function ChartIdProvider({ children, value }: { children: React.ReactNode; value: string }) {
  return <ChartIdContext.Provider value={value}>{children}</ChartIdContext.Provider>
}

function useChartId() {
  const context = React.useContext(ChartIdContext)
  if (!context) {
    throw new Error("useChartId must be used within a <ChartIdProvider />")
  }
  return context
}

const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: any[]
  label?: string
}) => {
  const config = useChart()
  const id = useChartId()

  if (active && payload && payload.length) {
    const value = payload[0].value
    const name = payload[0].name
    const color = config[name]?.color || "currentColor"

    return (
      <div
        className="rounded-md border bg-background p-2 text-sm shadow-md"
        style={{ "--color": color } as React.CSSProperties}
      >
        <p className="font-medium text-[--color]">{name}</p>
        <p className="text-muted-foreground">{label}</p>
        <p className="text-foreground">{value}</p>
      </div>
    )
  }

  return null
}

const ChartLegend = ({ payload }: { payload?: any[] }) => {
  const config = useChart()
  const id = useChartId()

  if (payload && payload.length) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4 p-2">
        {payload.map((entry: any) => {
          const name = entry.value
          const color = config[name]?.color || "currentColor"
          return (
            <div
              key={entry.value}
              className="flex items-center gap-1.5"
              style={{ "--color": color } as React.CSSProperties}
            >
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-sm text-muted-foreground">{name}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return null
}

const ChartCrosshair = ({ x, y, width, height, stroke, strokeDasharray }: any) => {
  return (
    <g>
      <line x1={x} y1={y} x2={x + width} y2={y} stroke={stroke} strokeDasharray={strokeDasharray} />
      <line x1={x} y1={y} x2={x} y2={y + height} stroke={stroke} strokeDasharray={strokeDasharray} />
    </g>
  )
}

const Chart = React.forwardRef<
  HTMLDivElement,
  RechartsChartProps & {
    asChild?: boolean
  }
>(({ asChild, className, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp ref={ref} className={cn("h-full w-full", className)}>
      <ResponsiveContainer>
        <RechartsChart {...props}>{children}</RechartsChart>
      </ResponsiveContainer>
    </Comp>
  )
})
Chart.displayName = "Chart"

export { Chart, ChartContainer, ChartTooltip, ChartLegend, ChartCrosshair, useChart }
