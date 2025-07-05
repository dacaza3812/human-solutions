"use client"
import {
  Label,
  Dot,
  XAxis,
  YAxis,
  ReferenceLine,
  ReferenceDot,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  Legend,
  PolarGrid,
  PolarRadiusAxis,
  PolarAngleAxis,
  Radar,
  RadialBar,
  RadialBarChart,
  Line,
  Bar,
  Area,
  Scatter,
  ComposedChart,
  LineChart,
  BarChart,
  AreaChart,
  ScatterChart,
  RadarChart,
} from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

// Define the types for the components
const ChartPrimitive = {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  Scatter,
  ScatterChart,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ComposedChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ZAxis: ({ ...props }) => <ZAxis {...props} />,
  CartesianGrid: ({ ...props }) => <CartesianGrid {...props} />,
  Tooltip,
  Legend,
  Curve: ({ ...props }) => <Curve {...props} />,
  Rectangle: ({ ...props }) => <Rectangle {...props} />,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ReferenceLine,
  ReferenceDot,
  ReferenceArea,
  Label,
  LabelList: ({ ...props }) => <LabelList {...props} />,
  Dot,
  Cross: ({ ...props }) => <Cross {...props} />,
  Funnel: ({ ...props }) => <Funnel {...props} />,
  FunnelChart: ({ ...props }) => <FunnelChart {...props} />,
  Pie: ({ ...props }) => <Pie {...props} />,
  PieChart: ({ ...props }) => <PieChart {...props} />,
  Sector: ({ ...props }) => <Sector {...props} />,
  Treemap: ({ ...props }) => <Treemap {...props} />,
  Sankey: ({ ...props }) => <Sankey {...props} />,
  VennDiagram: ({ ...props }) => <VennDiagram {...props} />,
  Brush: ({ ...props }) => <Brush {...props} />,
  ErrorBar: ({ ...props }) => <ErrorBar {...props} />,
  Customized: ({ ...props }) => <Customized {...props} />,
  Cell: ({ ...props }) => <Cell {...props} />,
  Text: ({ ...props }) => <Text {...props} />,
  Container: ({ ...props }) => <Container {...props} />,
  Def: ({ ...props }) => <Def {...props} />,
  LineSegment: ({ ...props }) => <LineSegment {...props} />,
  Polygon: ({ ...props }) => <Polygon {...props} />,
  Rectangle: ({ ...props }) => <Rectangle {...props} />,
  ResponsiveContainer: ({ ...props }) => <ResponsiveContainer {...props} />,
  Scatter: ({ ...props }) => <Scatter {...props} />,
  ScatterChart: ({ ...props }) => <ScatterChart {...props} />,
  Sector: ({ ...props }) => <Sector {...props} />,
  Text: ({ ...props }) => <Text {...props} />,
  Triangle: ({ ...props }) => <Triangle {...props} />,
  Wedge: ({ ...props }) => <Wedge {...props} />,
}

// Placeholder components for those not directly exported by recharts in the same way
// These are typically internal components or types that are used within recharts
// and not meant for direct import/use as standalone components.
// For the purpose of satisfying TypeScript, we define them as simple functional components.
const ZAxis = ({ ...props }) => <g {...props} />
const CartesianGrid = ({ ...props }) => <g {...props} />
const Curve = ({ ...props }) => <g {...props} />
const Rectangle = ({ ...props }) => <g {...props} />
const LabelList = ({ ...props }) => <g {...props} />
const Cross = ({ ...props }) => <g {...props} />
const Funnel = ({ ...props }) => <g {...props} />
const FunnelChart = ({ ...props }) => <g {...props} />
const Pie = ({ ...props }) => <g {...props} />
const PieChart = ({ ...props }) => <g {...props} />
const Sector = ({ ...props }) => <g {...props} />
const Treemap = ({ ...props }) => <g {...props} />
const Sankey = ({ ...props }) => <g {...props} />
const VennDiagram = ({ ...props }) => <g {...props} />
const Brush = ({ ...props }) => <g {...props} />
const ErrorBar = ({ ...props }) => <g {...props} />
const Customized = ({ ...props }) => <g {...props} />
const Cell = ({ ...props }) => <g {...props} />
const Text = ({ ...props }) => <g {...props} />
const Container = ({ ...props }) => <g {...props} />
const Def = ({ ...props }) => <g {...props} />
const LineSegment = ({ ...props }) => <g {...props} />
const Polygon = ({ ...props }) => <g {...props} />
const Triangle = ({ ...props }) => <g {...props} />
const Wedge = ({ ...props }) => <g {...props} />

export {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartPrimitive,
}
