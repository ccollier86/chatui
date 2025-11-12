"use client"

import * as React from "react"
import { useStickToBottom } from "use-stick-to-bottom"
import { cn } from "@/lib/utils"

interface ChatContainerRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function ChatContainerRoot({ children, className, ...props }: ChatContainerRootProps) {
  const { scrollRef, isAtBottom } = useStickToBottom()

  return (
    <div
      ref={scrollRef}
      className={cn("h-full overflow-y-auto", className)}
      data-scroll-container="true"
      {...props}
    >
      {children}
    </div>
  )
}

interface ChatContainerContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function ChatContainerContent({ children, className, ...props }: ChatContainerContentProps) {
  return (
    <div className={cn("mx-auto max-w-3xl px-4", className)} {...props}>
      {children}
    </div>
  )
}

interface ChatContainerScrollAnchorProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export const ChatContainerScrollAnchor = React.forwardRef<
  HTMLDivElement,
  ChatContainerScrollAnchorProps
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("h-px w-full", className)} {...props} />
})

ChatContainerScrollAnchor.displayName = "ChatContainerScrollAnchor"
