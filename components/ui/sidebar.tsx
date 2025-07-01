"use client"

import { Input } from "@/components/ui/input"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronRight, Menu } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"

const SidebarContext = React.createContext<{
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  isCollapsed: boolean
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  isMobile: boolean
}>({
  isOpen: false,
  setIsOpen: () => {},
  isCollapsed: false,
  setIsCollapsed: () => {},
  isMobile: false,
})

const SidebarProvider = ({
  children,
  isCollapsed: isCollapsedProp,
  defaultCollapsed = false,
  isMobile,
}: {
  children: React.ReactNode
  isCollapsed?: boolean
  defaultCollapsed?: boolean
  isMobile?: boolean
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isCollapsed, setIsCollapsed] = React.useState(isCollapsedProp ?? defaultCollapsed)

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        setIsOpen,
        isCollapsed,
        setIsCollapsed,
        isMobile: isMobile ?? false,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

const useSidebar = () => {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

const sidebarVariants = cva("group/sidebar h-full flex flex-col relative", {
  variants: {
    variant: {
      default: "bg-background text-foreground",
    },
    isCollapsed: {
      true: "w-16",
      false: "w-64",
    },
  },
  defaultVariants: {
    variant: "default",
    isCollapsed: false,
  },
})

interface SidebarProps extends React.ComponentPropsWithoutRef<"aside">, VariantProps<typeof sidebarVariants> {}

const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ className, variant, isCollapsed: isCollapsedProp, ...props }, ref) => {
    const { isCollapsed, isMobile, isOpen, setIsOpen } = useSidebar()

    if (isMobile) {
      return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left" size="content" className="pr-0">
            <aside ref={ref} className={cn(sidebarVariants({ variant, isCollapsed: false }), className)} {...props} />
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <aside
        ref={ref}
        className={cn(
          sidebarVariants({ variant, isCollapsed: isCollapsedProp ?? isCollapsed }),
          {
            "transition-all duration-300 ease-in-out": isCollapsedProp === undefined,
          },
          className,
        )}
        {...props}
      />
    )
  },
)
Sidebar.displayName = "Sidebar"

const SidebarToggle = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof Button>>(
  ({ className, ...props }, ref) => {
    const { isCollapsed, setIsCollapsed, isMobile, setIsOpen } = useSidebar()

    if (isMobile) {
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
        </Button>
      )
    }

    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        className={cn(
          "absolute -right-4 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full border bg-background",
          className,
        )}
        onClick={() => setIsCollapsed(!isCollapsed)}
        {...props}
      >
        <ChevronRight
          className={cn(
            "h-4 w-4 transition-transform duration-300 ease-in-out",
            isCollapsed ? "rotate-0" : "rotate-180",
          )}
        />
      </Button>
    )
  },
)
SidebarToggle.displayName = "SidebarToggle"

const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => {
    const { isCollapsed } = useSidebar()
    return (
      <div
        ref={ref}
        className={cn("flex items-center p-4", isCollapsed ? "justify-center" : "justify-between", className)}
        {...props}
      />
    )
  },
)
SidebarHeader.displayName = "SidebarHeader"

const SidebarHeaderTitle = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<"h3">>(
  ({ className, ...props }, ref) => {
    const { isCollapsed } = useSidebar()
    if (isCollapsed) return null
    return <h3 ref={ref} className={cn("text-lg font-semibold tracking-tight", className)} {...props} />
  },
)
SidebarHeaderTitle.displayName = "SidebarHeaderTitle"

const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => {
    return <ScrollArea ref={ref} className={cn("h-full p-4", className)} {...props} />
  },
)
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => {
    const { isCollapsed } = useSidebar()
    return (
      <div
        ref={ref}
        className={cn("flex items-center p-4", isCollapsed ? "justify-center" : "justify-between", className)}
        {...props}
      />
    )
  },
)
SidebarFooter.displayName = "SidebarFooter"

const SidebarFooterCollapseButton = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof Button>>(
  ({ className, ...props }, ref) => {
    const { isCollapsed } = useSidebar()
    if (isCollapsed) return null
    return <Button ref={ref} variant="ghost" size="icon" className={cn("h-8 w-8", className)} {...props} />
  },
)
SidebarFooterCollapseButton.displayName = "SidebarFooterCollapseButton"

const SidebarMenu = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("space-y-1", className)} {...props} />,
)
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("relative", className)} {...props} />,
)
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva("flex items-center rounded-md px-3 py-2 text-sm font-medium", {
  variants: {
    variant: {
      default: "hover:bg-accent hover:text-accent-foreground",
      ghost: "bg-transparent",
    },
    isActive: {
      true: "bg-accent text-accent-foreground",
    },
    isCollapsed: {
      true: "justify-center",
      false: "justify-start",
    },
  },
  defaultVariants: {
    variant: "default",
    isActive: false,
    isCollapsed: false,
  },
})

interface SidebarMenuButtonProps
  extends React.ComponentPropsWithoutRef<typeof Button>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean
}

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, variant, isActive, isCollapsed: isCollapsedProp, asChild = false, ...props }, ref) => {
    const { isCollapsed } = useSidebar()
    const Comp = asChild ? Slot : Button
    return (
      <Comp
        ref={ref}
        variant="ghost"
        className={cn(
          sidebarMenuButtonVariants({
            variant,
            isActive,
            isCollapsed: isCollapsedProp ?? isCollapsed,
          }),
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarMenuLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & VariantProps<typeof sidebarMenuButtonVariants>
>(({ className, variant, isActive, isCollapsed: isCollapsedProp, ...props }, ref) => {
  const { isCollapsed } = useSidebar()
  return (
    <a
      ref={ref}
      className={cn(
        sidebarMenuButtonVariants({
          variant,
          isActive,
          isCollapsed: isCollapsedProp ?? isCollapsed,
        }),
        className,
      )}
      {...props}
    />
  )
})
SidebarMenuLink.displayName = "SidebarMenuLink"

const SidebarMenuIcon = React.forwardRef<SVGSVGElement, React.ComponentPropsWithoutRef<"svg">>(
  ({ className, ...props }, ref) => {
    const { isCollapsed } = useSidebar()
    if (isCollapsed) {
      return (
        <svg
          ref={ref}
          className={cn("h-5 w-5", className)}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...props}
        />
      )
    }
    return null
  },
)
SidebarMenuIcon.displayName = "SidebarMenuIcon"

const SidebarMenuLabel = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<"span">>(
  ({ className, ...props }, ref) => {
    const { isCollapsed } = useSidebar()
    if (isCollapsed) return null
    return <span ref={ref} className={cn("ml-3", className)} {...props} />
  },
)
SidebarMenuLabel.displayName = "SidebarMenuLabel"

const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("grid gap-1", className)} {...props} />,
)
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<HTMLParagraphElement, React.ComponentPropsWithoutRef<"p">>(
  ({ className, ...props }, ref) => {
    const { isCollapsed } = useSidebar()
    if (isCollapsed) return null
    return <p ref={ref} className={cn("px-3 py-2 text-sm font-semibold", className)} {...props} />
  },
)
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("grid gap-1", className)} {...props} />,
)
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarInset = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex-1", className)} {...props} />,
)
SidebarInset.displayName = "SidebarInset"

const SidebarRail = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("absolute right-0 top-0 h-full w-px bg-border group-hover/sidebar:w-0", className)}
      {...props}
    />
  ),
)
SidebarRail.displayName = "SidebarRail"

const SidebarInput = React.forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<typeof Input>>(
  ({ className, ...props }, ref) => {
    const { isCollapsed } = useSidebar()
    if (isCollapsed) return null
    return <Input ref={ref} className={cn("h-8", className)} {...props} />
  },
)
SidebarInput.displayName = "SidebarInput"

export {
  SidebarProvider,
  Sidebar,
  SidebarToggle,
  SidebarHeader,
  SidebarHeaderTitle,
  SidebarContent,
  SidebarFooter,
  SidebarFooterCollapseButton,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuLink,
  SidebarMenuIcon,
  SidebarMenuLabel,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarInset,
  SidebarRail,
  SidebarInput,
  useSidebar,
}
