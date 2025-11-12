"use client"

import * as React from "react"
import { AlertTriangle, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error boundary caught an error:", error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} reset={this.reset} />
      }

      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error
  reset: () => void
}

function DefaultErrorFallback({ error, reset }: ErrorFallbackProps) {
  return (
    <div
      className="flex h-full w-full items-center justify-center bg-background p-8"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="h-12 w-12 text-destructive" aria-hidden="true" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">
            We encountered an unexpected error. Please try refreshing the page or resetting
            the application.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="rounded-lg border bg-muted/50 p-4 text-left">
            <summary className="cursor-pointer font-mono text-xs font-semibold">
              Error Details
            </summary>
            <pre className="mt-2 overflow-auto text-xs text-muted-foreground">
              {error.message}
              {"\n\n"}
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={reset} className="gap-2" aria-label="Try again">
            <RotateCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            aria-label="Reload page"
          >
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  )
}
