"use client"

import * as React from "react"
import TextareaAutosize from "react-textarea-autosize"
import { cn } from "@/lib/utils"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

const PromptInputContext = React.createContext<{
  isLoading: boolean
  onSubmit: () => void
} | null>(null)

interface PromptInputProps {
  isLoading?: boolean
  value: string
  onValueChange: (value: string) => void
  maxHeight?: number | string
  onSubmit: () => void
  children?: React.ReactNode
  className?: string
}

export function PromptInput({
  isLoading = false,
  value,
  onValueChange,
  maxHeight = 240,
  onSubmit,
  children,
  className,
}: PromptInputProps) {
  return (
    <PromptInputContext.Provider value={{ isLoading, onSubmit }}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!isLoading && value.trim()) {
            onSubmit()
          }
        }}
        className={cn(
          "relative flex items-end gap-2 rounded-lg border bg-background p-2",
          className
        )}
      >
        <div className="flex-1 flex flex-col gap-2">
          <PromptInputTextarea
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            maxHeight={maxHeight}
            disabled={isLoading}
          />
          {children}
        </div>
      </form>
    </PromptInputContext.Provider>
  )
}

interface PromptInputTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  maxHeight?: number | string
  disableAutosize?: boolean
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

export function PromptInputTextarea({
  maxHeight = 240,
  disableAutosize = false,
  className,
  onKeyDown,
  ...props
}: PromptInputTextareaProps) {
  const context = React.useContext(PromptInputContext)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (context && !context.isLoading) {
        context.onSubmit()
      }
    }
    onKeyDown?.(e)
  }

  const baseClassName = cn(
    "w-full resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50",
    className
  )

  if (disableAutosize) {
    return (
      <textarea
        className={baseClassName}
        onKeyDown={handleKeyDown}
        {...props}
      />
    )
  }

  return (
    <TextareaAutosize
      className={baseClassName}
      onKeyDown={handleKeyDown}
      maxRows={10}
      {...(props as any)}
    />
  )
}

export function PromptInputActions({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      {children}
    </div>
  )
}

interface PromptInputActionProps extends React.ComponentProps<typeof Tooltip> {
  tooltip?: React.ReactNode
  children: React.ReactNode
  className?: string
  side?: "top" | "bottom" | "left" | "right"
  disabled?: boolean
}

export function PromptInputAction({
  tooltip,
  children,
  className,
  side = "top",
  disabled = false,
  ...props
}: PromptInputActionProps) {
  if (!tooltip) {
    return <div className={className}>{children}</div>
  }

  return (
    <TooltipProvider>
      <Tooltip {...props}>
        <TooltipTrigger asChild disabled={disabled}>
          <div className={className}>{children}</div>
        </TooltipTrigger>
        <TooltipContent side={side}>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
