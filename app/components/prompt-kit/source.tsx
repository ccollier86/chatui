"use client"

import * as React from "react"
import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

interface SourceContextValue {
  href: string
}

const SourceContext = React.createContext<SourceContextValue | null>(null)

interface SourceProps {
  href: string
  children: React.ReactNode
}

export function Source({ href, children }: SourceProps) {
  return (
    <SourceContext.Provider value={{ href }}>
      <HoverCard>
        {children}
      </HoverCard>
    </SourceContext.Provider>
  )
}

interface SourceTriggerProps {
  label: string
  showFavicon?: boolean
  className?: string
}

export function SourceTrigger({
  label,
  showFavicon = false,
  className,
}: SourceTriggerProps) {
  const context = React.useContext(SourceContext)

  if (!context) {
    throw new Error("SourceTrigger must be used within Source")
  }

  const domain = React.useMemo(() => {
    try {
      return new URL(context.href).hostname
    } catch {
      return ""
    }
  }, [context.href])

  return (
    <HoverCardTrigger asChild>
      <a
        href={context.href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-1 rounded border bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          className
        )}
      >
        {showFavicon && (
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
            alt=""
            className="h-3 w-3"
          />
        )}
        <span>{label}</span>
        <ExternalLink className="h-2.5 w-2.5" />
      </a>
    </HoverCardTrigger>
  )
}

interface SourceContentProps {
  title: string
  description?: string
  className?: string
}

export function SourceContent({
  title,
  description,
  className,
}: SourceContentProps) {
  const context = React.useContext(SourceContext)

  if (!context) {
    throw new Error("SourceContent must be used within Source")
  }

  const domain = React.useMemo(() => {
    try {
      return new URL(context.href).hostname
    } catch {
      return context.href
    }
  }, [context.href])

  return (
    <HoverCardContent className={cn("w-80", className)}>
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
            alt=""
            className="h-5 w-5 mt-0.5"
          />
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-semibold leading-none">{title}</h4>
            <p className="text-xs text-muted-foreground">{domain}</p>
          </div>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </HoverCardContent>
  )
}
