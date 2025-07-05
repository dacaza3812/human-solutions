import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 text-center">
        <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
        <Skeleton className="h-6 w-1/2 mx-auto mb-8" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4 w-1/3 mx-auto" />
      </Card>
    </div>
  )
}
