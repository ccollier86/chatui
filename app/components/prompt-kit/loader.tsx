"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type LoaderVariant =
  | "circular"
  | "classic"
  | "pulse"
  | "pulse-dot"
  | "dots"
  | "typing"
  | "wave"
  | "bars"
  | "terminal"
  | "text-blink"
  | "text-shimmer"
  | "loading-dots"

type LoaderSize = "sm" | "md" | "lg"

interface LoaderProps {
  variant?: LoaderVariant
  size?: LoaderSize
  text?: string
  className?: string
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
}

export function Loader({
  variant = "circular",
  size = "md",
  text,
  className,
}: LoaderProps) {
  switch (variant) {
    case "circular":
      return (
        <div
          className={cn(
            "inline-block animate-spin rounded-full border-2 border-current border-t-transparent",
            sizeClasses[size],
            className
          )}
          role="status"
          aria-label="Loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
      )

    case "classic":
      return (
        <div
          className={cn(
            "inline-block animate-spin rounded-full border-4 border-muted border-t-primary",
            sizeClasses[size],
            className
          )}
          role="status"
          aria-label="Loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
      )

    case "pulse":
      return (
        <div
          className={cn(
            "inline-block animate-[thin-pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite] rounded-full bg-primary",
            sizeClasses[size],
            className
          )}
          role="status"
          aria-label="Loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
      )

    case "pulse-dot":
      return (
        <div className={cn("inline-flex items-center gap-1", className)} role="status" aria-label="Loading">
          <div
            className={cn(
              "animate-[pulse-dot_1.4s_ease-in-out_infinite] rounded-full bg-primary",
              size === "sm" ? "h-2 w-2" : size === "md" ? "h-2.5 w-2.5" : "h-3 w-3"
            )}
          />
          <div
            className={cn(
              "animate-[pulse-dot_1.4s_ease-in-out_0.2s_infinite] rounded-full bg-primary",
              size === "sm" ? "h-2 w-2" : size === "md" ? "h-2.5 w-2.5" : "h-3 w-3"
            )}
          />
          <div
            className={cn(
              "animate-[pulse-dot_1.4s_ease-in-out_0.4s_infinite] rounded-full bg-primary",
              size === "sm" ? "h-2 w-2" : size === "md" ? "h-2.5 w-2.5" : "h-3 w-3"
            )}
          />
          <span className="sr-only">Loading...</span>
        </div>
      )

    case "dots":
      return (
        <div className={cn("inline-flex items-center gap-1", className)} role="status" aria-label="Loading">
          <div
            className={cn(
              "animate-[bounce-dots_1s_ease-in-out_infinite] rounded-full bg-primary",
              size === "sm" ? "h-1.5 w-1.5" : size === "md" ? "h-2 w-2" : "h-2.5 w-2.5"
            )}
            style={{ animationDelay: "0ms" }}
          />
          <div
            className={cn(
              "animate-[bounce-dots_1s_ease-in-out_infinite] rounded-full bg-primary",
              size === "sm" ? "h-1.5 w-1.5" : size === "md" ? "h-2 w-2" : "h-2.5 w-2.5"
            )}
            style={{ animationDelay: "150ms" }}
          />
          <div
            className={cn(
              "animate-[bounce-dots_1s_ease-in-out_infinite] rounded-full bg-primary",
              size === "sm" ? "h-1.5 w-1.5" : size === "md" ? "h-2 w-2" : "h-2.5 w-2.5"
            )}
            style={{ animationDelay: "300ms" }}
          />
          <span className="sr-only">Loading...</span>
        </div>
      )

    case "typing":
      return (
        <div className={cn("inline-flex items-center gap-1", className)} role="status" aria-label="Loading">
          <div
            className={cn(
              "animate-[typing_1s_ease-in-out_infinite] rounded-full bg-primary",
              size === "sm" ? "h-1.5 w-1.5" : size === "md" ? "h-2 w-2" : "h-2.5 w-2.5"
            )}
            style={{ animationDelay: "0ms" }}
          />
          <div
            className={cn(
              "animate-[typing_1s_ease-in-out_infinite] rounded-full bg-primary",
              size === "sm" ? "h-1.5 w-1.5" : size === "md" ? "h-2 w-2" : "h-2.5 w-2.5"
            )}
            style={{ animationDelay: "150ms" }}
          />
          <div
            className={cn(
              "animate-[typing_1s_ease-in-out_infinite] rounded-full bg-primary",
              size === "sm" ? "h-1.5 w-1.5" : size === "md" ? "h-2 w-2" : "h-2.5 w-2.5"
            )}
            style={{ animationDelay: "300ms" }}
          />
          <span className="sr-only">Loading...</span>
        </div>
      )

    case "wave":
      return (
        <div className={cn("inline-flex items-center gap-0.5", className)} role="status" aria-label="Loading">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                "animate-[wave_1.2s_ease-in-out_infinite] bg-primary",
                size === "sm" ? "h-3 w-0.5" : size === "md" ? "h-4 w-1" : "h-5 w-1"
              )}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
          <span className="sr-only">Loading...</span>
        </div>
      )

    case "bars":
      return (
        <div className={cn("inline-flex items-center gap-0.5", className)} role="status" aria-label="Loading">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "animate-[wave-bars_1.2s_ease-in-out_infinite] bg-primary",
                size === "sm" ? "h-3 w-1" : size === "md" ? "h-4 w-1.5" : "h-5 w-2"
              )}
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
          <span className="sr-only">Loading...</span>
        </div>
      )

    case "terminal":
      return (
        <div className={cn("inline-flex items-center gap-1", className)} role="status" aria-label="Loading">
          <span className={cn("font-mono", size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base")}>
            {text || "Loading"}
          </span>
          <span className="animate-[blink_1s_step-end_infinite] font-mono">▋</span>
          <span className="sr-only">Loading...</span>
        </div>
      )

    case "text-blink":
      return (
        <div className={cn("inline-flex items-center", className)} role="status" aria-label="Loading">
          <span
            className={cn(
              "animate-[text-blink_1.4s_ease-in-out_infinite] font-medium",
              size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"
            )}
          >
            {text || "Loading..."}
          </span>
          <span className="sr-only">Loading...</span>
        </div>
      )

    case "text-shimmer":
      return (
        <div className={cn("inline-flex items-center", className)} role="status" aria-label="Loading">
          <span
            className={cn(
              "animate-[shimmer-text_2s_linear_infinite] bg-gradient-to-r from-muted-foreground via-primary to-muted-foreground bg-[length:200%_100%] bg-clip-text font-medium text-transparent",
              size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"
            )}
          >
            {text || "Loading..."}
          </span>
          <span className="sr-only">Loading...</span>
        </div>
      )

    case "loading-dots":
      return (
        <div className={cn("inline-flex items-center gap-1", className)} role="status" aria-label="Loading">
          <span className={cn("font-medium", size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base")}>
            {text || "Loading"}
          </span>
          <span
            className="animate-[loading-dots_1.4s_ease-in-out_infinite]"
            style={{ animationDelay: "0ms" }}
          >
            .
          </span>
          <span
            className="animate-[loading-dots_1.4s_ease-in-out_infinite]"
            style={{ animationDelay: "200ms" }}
          >
            .
          </span>
          <span
            className="animate-[loading-dots_1.4s_ease-in-out_infinite]"
            style={{ animationDelay: "400ms" }}
          >
            .
          </span>
          <span className="sr-only">Loading...</span>
        </div>
      )

    default:
      return null
  }
}
