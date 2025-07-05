"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Formatters
const UNIT_RE = /\[(.*?)\]$/
const PERCENT_RE = /^(.*?)%$/

type ChartConfig = {
  [k: string]: {
    label?: string
    icon?: React.ComponentType
    color?: string
    unit?: string
    format?: (value: number) => string
  }
}

type ChartContextProps = {
  config: ChartConfig
} & (
  | {
      initialData: RechartsPrimitive.ChartProps["data"]
      data?: never
    }
  | {
      data: RechartsPrimitive.ChartProps["data"]
      initialData?: never
    }
)

const ChartContext = React.createContext<ChartContextProps | null>(null)

function ChartProvider({ config, data, initialData, children }: ChartContextProps & { children: React.ReactNode }) {
  const chartData = React.useRef(data || initialData)
  const value = React.useMemo(
    () => ({
      config,
      initialData: initialData || chartData.current,
      data: data || chartData.current,
    }),
    [config, initialData, data],
  )
  return <ChartContext.Provider value={value}>{children}</ChartContext.Provider>
}

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartProvider />")
  }
  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    config: ChartConfig
    initialData?: RechartsPrimitive.ChartProps["data"]
    data?: RechartsPrimitive.ChartProps["data"]
  }
>(({ id, className, children, config, initialData, data, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId}`
  return (
    <ChartProvider config={config} initialData={initialData} data={data}>
      <div ref={ref} className={cn("flex aspect-video justify-center text-foreground", className)} {...props}>
        <svg width={0} height={0}>
          <defs>
            <style>
              {`
                .chart-${chartId}-tooltip {
                  filter: drop-shadow(0px 1px 1px hsl(var(--chart-foreground) / 0.075))
                    drop-shadow(0px 2px 2px hsl(var(--chart-foreground) / 0.05));
                }
              `}
            </style>
          </defs>
        </svg>
        {children}
      </div>
    </ChartProvider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Tooltip> & {
    hideIndicator?: boolean
    hideLabel?: boolean
    formatter?: ChartConfig[keyof ChartConfig]["format"]
  }
>(({ active, payload, className, formatter, hideIndicator, hideLabel, labelFormatter, ...props }, ref) => {
  const { config } = useChart()

  if (hideLabel) {
    return null
  }

  if (active && payload && payload.length) {
    const relevantPayload = payload.filter((item) => config[item.dataKey as keyof ChartConfig]?.label)
    if (relevantPayload.length === 0) return null

    return (
      <div
        ref={ref}
        className={cn(
          "chart-tooltip grid min-w-[130px] items-center justify-items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-2 font-sans text-xs shadow-md",
          className,
        )}
        {...props}
      >
        {labelFormatter ? (
          labelFormatter(payload[0].payload.label, payload)
        ) : (
          <div className="text-muted-foreground">{payload[0].payload.label}</div>
        )}
        <div className="grid gap-1.5">
          {relevantPayload.map((item, i) => {
            const key = item.dataKey as keyof ChartConfig
            const configItem = config[key]

            if (!configItem) return null

            const indicatorColor = configItem.color || item.stroke || item.fill

            return (
              <div key={item.dataKey} className="flex w-full items-stretch gap-2">
                {!hideIndicator && (
                  <div
                    className={cn("flex h-2 w-2 rounded-full", indicatorColor && `bg-${indicatorColor}`)}
                    style={{ backgroundColor: indicatorColor }}
                  />
                )}
                <div className="flex flex-1 justify-between">
                  <span className="text-muted-foreground">{configItem.label}</span>
                  <span className="font-medium text-foreground">
                    {formatter
                      ? formatter(item.value as number)
                      : configItem.format
                        ? configItem.format(item.value as number)
                        : item.value}
                    {configItem.unit}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return null
})
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof ChartTooltip>>(
  (props, ref) => (
    <RechartsPrimitive.Tooltip
      cursor={{ stroke: "hsl(var(--muted-foreground))", strokeOpacity: 0.15 }}
      content={<ChartTooltip ref={ref} {...props} />}
    />
  ),
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Legend> & {
    hideIcon?: boolean
  }
>(({ className, hideIcon, payload, ...props }, ref) => {
  const { config } = useChart()

  if (!payload || payload.length === 0) {
    return null
  }

  return (
    <div ref={ref} className={cn("flex items-center justify-center gap-4", className)} {...props}>
      {payload.map((item) => {
        const key = item.dataKey as keyof ChartConfig
        const configItem = config[key]

        if (!configItem) return null

        return (
          <div key={item.value} className="flex items-center gap-1.5">
            {!hideIcon && (
              <div
                className={cn("h-3 w-3 shrink-0 rounded-full", configItem.color && `bg-${configItem.color}`)}
                style={{
                  backgroundColor: configItem.color || item.color,
                }}
              />
            )}
            <span>{configItem.label}</span>
          </div>
        )
      })}
    </div>
  )
})
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof ChartLegend>>(
  (props, ref) => <RechartsPrimitive.Legend content={<ChartLegend ref={ref} {...props} />} />,
)
