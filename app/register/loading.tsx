import { CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RegisterLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            <Skeleton className="h-8 w-3/4 mx-auto" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
