"use client"

import * as React from "react"
import { ChevronDown, CheckCircle2, XCircle, Loader2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToolPart {
  type: string
  state?: "pending" | "running" | "completed" | "error"
  input?: Record<string, unknown>
  output?: Record<string, unknown>
  toolCallId?: string
  errorText?: string
}

interface ToolProps {
  toolPart: ToolPart
  defaultOpen?: boolean
  className?: string
}

const stateConfig = {
  pending: {
    icon: Clock,
    label: "Pending",
    color: "text-muted-foreground",
  },
  running: {
    icon: Loader2,
    label: "Running",
    color: "text-blue-500",
    animate: "animate-spin",
  },
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    color: "text-green-500",
  },
  error: {
    icon: XCircle,
    label: "Error",
    color: "text-destructive",
  },
}

export function Tool({ toolPart, defaultOpen = false, className }: ToolProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  const state = toolPart.state || "completed"
  const config = stateConfig[state] || stateConfig.completed
  const Icon = config.icon

  return (
    <div
      className={cn(
        "rounded-lg border bg-muted/50",
        state === "error" && "border-destructive/50 bg-destructive/5",
        className
      )}
    >
      {/* Header */}
      <button
        className="flex w-full items-center justify-between px-4 py-3 text-sm hover:bg-muted/80"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", config.color, "animate" in config && config.animate)} />
          <span className="font-medium">{toolPart.type}</span>
          <span className="text-xs text-muted-foreground">
            {config.label}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Content */}
      {isOpen && (
        <div className="space-y-3 border-t px-4 py-3">
          {/* Tool Call ID */}
          {toolPart.toolCallId && (
            <div>
              <div className="mb-1 text-xs font-medium text-muted-foreground">
                Tool Call ID
              </div>
              <code className="text-xs">{toolPart.toolCallId}</code>
            </div>
          )}

          {/* Input */}
          {toolPart.input && Object.keys(toolPart.input).length > 0 && (
            <div>
              <div className="mb-1 text-xs font-medium text-muted-foreground">
                Input
              </div>
              <pre className="overflow-x-auto rounded bg-background p-2 text-xs">
                {JSON.stringify(toolPart.input, null, 2)}
              </pre>
            </div>
          )}

          {/* Output */}
          {toolPart.output && Object.keys(toolPart.output).length > 0 && (
            <div>
              <div className="mb-1 text-xs font-medium text-muted-foreground">
                Output
              </div>
              <pre className="overflow-x-auto rounded bg-background p-2 text-xs">
                {JSON.stringify(toolPart.output, null, 2)}
              </pre>
            </div>
          )}

          {/* Error */}
          {toolPart.errorText && (
            <div>
              <div className="mb-1 text-xs font-medium text-destructive">
                Error
              </div>
              <div className="rounded bg-destructive/10 p-2 text-xs text-destructive">
                {toolPart.errorText}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
