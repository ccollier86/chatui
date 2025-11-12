"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Markdown } from "./markdown"

interface ReasoningContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  isStreaming?: boolean
}

const ReasoningContext = React.createContext<ReasoningContextValue | null>(null)

interface ReasoningProps {
  children: React.ReactNode
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  isStreaming?: boolean
}

export function Reasoning({
  children,
  className,
  open: controlledOpen,
  onOpenChange,
  isStreaming,
}: ReasoningProps) {
  const [internalOpen, setInternalOpen] = React.useState(true)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? onOpenChange || (() => {}) : setInternalOpen

  // Auto-close when streaming ends
  React.useEffect(() => {
    if (isStreaming === false && open) {
      setOpen(false)
    }
  }, [isStreaming, open, setOpen])

  return (
    <ReasoningContext.Provider value={{ open, setOpen, isStreaming }}>
      <div className={cn("rounded-lg border bg-muted/50", className)}>
        {children}
      </div>
    </ReasoningContext.Provider>
  )
}

interface ReasoningTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

export function ReasoningTrigger({
  children,
  className,
  ...props
}: ReasoningTriggerProps) {
  const context = React.useContext(ReasoningContext)

  if (!context) {
    throw new Error("ReasoningTrigger must be used within Reasoning")
  }

  return (
    <button
      className={cn(
        "flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/80",
        className
      )}
      onClick={() => context.setOpen(!context.open)}
      aria-expanded={context.open}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 transition-transform duration-200",
          context.open && "rotate-180"
        )}
      />
    </button>
  )
}

interface ReasoningContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  markdown?: boolean
}

export function ReasoningContent({
  children,
  className,
  contentClassName,
  markdown = false,
  ...props
}: ReasoningContentProps) {
  const context = React.useContext(ReasoningContext)

  if (!context) {
    throw new Error("ReasoningContent must be used within Reasoning")
  }

  if (!context.open) return null

  return (
    <div
      className={cn(
        "overflow-hidden border-t transition-all",
        className
      )}
      {...props}
    >
      <div className={cn("px-4 py-3 text-sm", contentClassName)}>
        {markdown && typeof children === "string" ? (
          <Markdown className="prose prose-sm max-w-none dark:prose-invert">
            {children}
          </Markdown>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
