"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronLeft, ChevronRight, Menu } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

const SidebarContext = React.createContext<{
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  isMobile: boolean
  setIsMobile: React.Dispatch<React.SetStateAction<boolean>>
} | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a <SidebarProvider />")
  }
  return context
}

const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = React.useState(true)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, isMobile, setIsMobile }}>{children}</SidebarContext.Provider>
  )
}

const sidebarVariants = cva("flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out", {
  variants: {
    isOpen: {
      true: "w-64",
      false: "w-0 md:w-16",
    },
  },
  defaultVariants: {
    isOpen: true,
  },
})

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof sidebarVariants> {}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(({ className, isOpen, ...props }, ref) => {
  const { isOpen: contextIsOpen, isMobile } = useSidebar()
  const effectiveIsOpen = isOpen !== undefined ? isOpen : contextIsOpen

  return (
    <aside
      ref={ref}
      className={cn(
        sidebarVariants({ isOpen: effectiveIsOpen }),
        isMobile && effectiveIsOpen ? "fixed inset-y-0 left-0 z-50" : "",
        className,
      )}
      {...props}
    />
  )
})
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex h-16 items-center px-4", className)} {...props} />
  ),
)
SidebarHeader.displayName = "SidebarHeader"

const SidebarToggle = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof Button>>(
  ({ className, ...props }, ref) => {
    const { isOpen, setIsOpen, isMobile } = useSidebar()
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", isMobile ? "mr-2" : "absolute -right-4 top-1/2 -translate-y-1/2", className)}
        onClick={() => setIsOpen(!isOpen)}
        {...props}
      >
        {isMobile ? (
          <Menu className="h-4 w-4" />
        ) : isOpen ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
    )
  },
)
SidebarToggle.displayName = "SidebarToggle"

const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <ScrollArea ref={ref} className={cn("flex-1 px-4 py-2", className)} {...props}>
      {children}
    </ScrollArea>
  ),
)
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex h-16 items-center px-4 border-t", className)} {...props} />
  ),
)
SidebarFooter.displayName = "SidebarFooter"

const SidebarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("grid gap-2 py-2", className)} {...props} />,
)
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { isOpen } = useSidebar()
    return (
      <p
        ref={ref}
        className={cn("text-sm font-semibold text-muted-foreground", !isOpen && "hidden", className)}
        {...props}
      />
    )
  },
)
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("grid gap-1", className)} {...props} />,
)
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("grid gap-1", className)} {...props} />,
)
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("relative", className)} {...props} />,
)
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
  "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
  {
    variants: {
      isActive: {
        true: "bg-accent text-accent-foreground",
      },
      isOpen: {
        false: "justify-center",
      },
    },
    defaultVariants: {
      isActive: false,
      isOpen: true,
    },
  },
)

interface SidebarMenuButtonProps
  extends React.ComponentPropsWithoutRef<typeof Button>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean
}

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, isActive, isOpen, asChild = false, ...props }, ref) => {
    const { isOpen: contextIsOpen } = useSidebar()
    const effectiveIsOpen = isOpen !== undefined ? isOpen : contextIsOpen
    const Comp = asChild ? Slot : Button

    return (
      <Comp
        ref={ref}
        variant="ghost"
        className={cn(sidebarMenuButtonVariants({ isActive, isOpen: effectiveIsOpen }), className)}
        {...props}
      />
    )
  },
)
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarMenuIcon = React.forwardRef<SVGSVGElement, React.ComponentPropsWithoutRef<"svg">>(
  ({ className, ...props }, ref) => {
    const { isOpen } = useSidebar()
    return <svg ref={ref} className={cn("h-5 w-5", !isOpen && "mr-0", isOpen && "mr-3", className)} {...props} />
  },
)
SidebarMenuIcon.displayName = "SidebarMenuIcon"

const SidebarMenuLabel = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => {
    const { isOpen } = useSidebar()
    return <span ref={ref} className={cn(!isOpen && "hidden", className)} {...props} />
  },
)
SidebarMenuLabel.displayName = "SidebarMenuLabel"

const SidebarRail = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { isOpen, isMobile } = useSidebar()
    return (
      <div
        ref={ref}
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-16 border-r bg-background",
          isOpen && "hidden",
          isMobile && "hidden",
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarRail.displayName = "SidebarRail"

const SidebarTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof Button>>(
  ({ className, ...props }, ref) => {
    const { setIsOpen, isMobile } = useSidebar()
    if (!isMobile) return null
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", className)}
        onClick={() => setIsOpen(true)}
        {...props}
      >
        <Menu className="h-4 w-4" />
        <span className="sr-only">Open Sidebar</span>
      </Button>
    )
  },
)
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarInset = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { isOpen, isMobile } = useSidebar()
    return (
      <div
        ref={ref}
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          !isMobile && isOpen ? "ml-64" : !isMobile && "ml-16",
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarInset.displayName = "SidebarInset"

export {
  Sidebar,
  SidebarHeader,
  SidebarToggle,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuIcon,
  SidebarMenuLabel,
  SidebarRail,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
}
