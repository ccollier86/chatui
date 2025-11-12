"use client"

import * as React from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PromptSuggestionProps extends Omit<ButtonProps, "children"> {
  children: React.ReactNode
  highlight?: string
}

export function PromptSuggestion({
  children,
  highlight,
  variant = "outline",
  size = "lg",
  className,
  ...props
}: PromptSuggestionProps) {
  // Highlight mode
  if (highlight && typeof children === "string") {
    const parts = children.split(new RegExp(`(${highlight})`, "gi"))

    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-auto whitespace-normal px-3 py-2 text-left font-normal",
          className
        )}
        {...props}
      >
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-primary/20 font-medium text-primary">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </Button>
    )
  }

  // Normal mode
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "h-auto whitespace-normal text-left font-normal",
        size === "lg" && "px-4 py-3",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}
