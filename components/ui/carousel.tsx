"use client"

import * as React from "react"
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type CarouselCoreProps = React.ComponentPropsWithoutRef<"div"> & {
  opts?: UseEmblaCarouselType[0]
  orientation?: "horizontal" | "vertical"
  plugins?: UseEmblaCarouselType[1]
}

type CarouselProps = CarouselCoreProps & {
  setApi?: (api: UseEmblaCarouselType[1]) => void
}

const CarouselContext = React.createContext<
  | {
      carouselRef: ReturnType<typeof useEmblaCarousel>[0]
      api: ReturnType<typeof useEmblaCarousel>[1]
      scrollPrev: () => void
      scrollNext: () => void
      canScrollPrev: boolean
      canScrollNext: boolean
      selectedIndex: number
      setSelectedIndex: React.Dispatch<React.SetStateAction<number>>
    }
  | undefined
>(undefined)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ opts, orientation = "horizontal", plugins, setApi, className, children, ...props }, ref) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins,
    )
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)
    const [selectedIndex, setSelectedIndex] = React.useState(0)

    const onSelect = React.useCallback((api: any) => {
      setSelectedIndex(api.selectedScrollSnap())
    }, [])

    const onInit = React.useCallback((api: any) => {
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }, [])

    const onScroll = React.useCallback((api: any) => {
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }, [])

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev()
    }, [api])

    const scrollNext = React.useCallback(() => {
      api?.scrollNext()
    }, [api])

    React.useEffect(() => {
      if (!api) {
        return
      }

      onInit(api)
      onSelect(api)
      api.on("reInit", onInit)
      api.on("reInit", onSelect)
      api.on("select", onSelect)
      api.on("scroll", onScroll)
      if (setApi) {
        setApi(api)
      }
    }, [api, onInit, onSelect, onScroll, setApi])

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api!,
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
          selectedIndex,
          setSelectedIndex,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={(e) => {
            if (e.key === "ArrowLeft") {
              e.preventDefault()
              scrollPrev()
            } else if (e.key === "ArrowRight") {
              e.preventDefault()
              scrollNext()
            }
          }}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          <div ref={carouselRef} className="overflow-hidden">
            <div className={cn("flex", orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col")}>{children}</div>
          </div>
        </div>
      </CarouselContext.Provider>
    )
  },
)
Carousel.displayName = "Carousel"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: "horizontal" | "vertical"
  }
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <div
    ref={ref}
    role="group"
    aria-roledescription="slide"
    className={cn("min-w-0 shrink-0 grow-0 basis-full", orientation === "horizontal" ? "pl-4" : "pt-4", className)}
    {...props}
  />
))
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof Button>>(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel()

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute h-8 w-8 rounded-full",
          orientation === "horizontal"
            ? "-left-12 top-1/2 -translate-y-1/2"
            : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
          className,
        )}
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        {...props}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Previous slide</span>
      </Button>
    )
  },
)
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof Button>>(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollNext, canScrollNext } = useCarousel()

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute h-8 w-8 rounded-full",
          orientation === "horizontal"
            ? "-right-12 top-1/2 -translate-y-1/2"
            : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
          className,
        )}
        onClick={scrollNext}
        disabled={!canScrollNext}
        {...props}
      >
        <ArrowRight className="h-4 w-4" />
        <span className="sr-only">Next slide</span>
      </Button>
    )
  },
)
CarouselNext.displayName = "CarouselNext"

export { Carousel, CarouselItem, CarouselPrevious, CarouselNext, useCarousel }
