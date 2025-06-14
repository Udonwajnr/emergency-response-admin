"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const SidebarContext = React.createContext({})

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = React.useState(true)
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, isCollapsed, setIsCollapsed }}>
      <div className="flex min-h-screen">{children}</div>
    </SidebarContext.Provider>
  )
}

export function Sidebar({ children, className }) {
  const { isOpen, isCollapsed } = React.useContext(SidebarContext)

  return (
    <div
      data-state={isOpen ? "open" : "closed"}
      data-collapsible={isCollapsed ? "icon" : "full"}
      className={cn(
        "group/sidebar-wrapper fixed left-0 top-0 z-20 flex h-full w-[270px] flex-col border-r bg-background transition-[width,transform] ease-linear",
        isOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed && "w-[70px]",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SidebarHeader({ children, className }) {
  return <div className={cn("flex h-16 shrink-0 items-center border-b", className)}>{children}</div>
}

export function SidebarContent({ children, className }) {
  return <div className={cn("flex-1 overflow-auto", className)}>{children}</div>
}

export function SidebarFooter({ children, className }) {
  return <div className={cn("border-t", className)}>{children}</div>
}

export function SidebarGroup({ children, className }) {
  return <div className={cn("space-y-1", className)}>{children}</div>
}

export function SidebarGroupLabel({ children, className }) {
  const { isCollapsed } = React.useContext(SidebarContext)

  return (
    <div
      className={cn(
        "px-4 py-2 text-xs font-medium text-muted-foreground transition-opacity",
        isCollapsed && "opacity-0",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SidebarGroupContent({ children, className }) {
  return <div className={cn("space-y-1", className)}>{children}</div>
}

export function SidebarMenu({ children, className }) {
  return <div className={cn("space-y-1", className)}>{children}</div>
}

export function SidebarMenuItem({ children, className }) {
  return <div className={cn("", className)}>{children}</div>
}

export function SidebarMenuButton({ children, className, asChild = false, ...props }) {
  const Comp = asChild ? React.Fragment : "button"
  const childProps = asChild ? {} : props

  return (
    <Comp
      className={cn(
        "group/sidebar-button flex w-full items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      {...childProps}
    >
      {children}
    </Comp>
  )
}

export function SidebarInset({ children, className }) {
  const { isOpen, isCollapsed } = React.useContext(SidebarContext)

  return (
    <div
      className={cn(
        "ml-0 flex flex-1 flex-col transition-[margin] ease-linear md:ml-[270px]",
        !isOpen && "md:ml-0",
        isCollapsed && "md:ml-[70px]",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SidebarTrigger({ className }) {
  const { isOpen, setIsOpen } = React.useContext(SidebarContext)

  return (
    <button
      className={cn("rounded-md p-1 hover:bg-accent", className)}
      onClick={() => setIsOpen(!isOpen)}
      aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <line x1="9" x2="9" y1="3" y2="21" />
      </svg>
    </button>
  )
}

export function SidebarCollapseTrigger({ className }) {
  const { isCollapsed, setIsCollapsed } = React.useContext(SidebarContext)

  return (
    <button
      className={cn("rounded-md p-1 hover:bg-accent", className)}
      onClick={() => setIsCollapsed(!isCollapsed)}
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="m15 15-6-6 6-6" />
      </svg>
    </button>
  )
}
