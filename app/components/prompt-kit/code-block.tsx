"use client"

import * as React from "react"
import { codeToHtml } from "shiki"
import { cn } from "@/lib/utils"

interface CodeBlockProps extends React.HTMLProps<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  return (
    <div
      className={cn(
        "not-prose relative rounded-lg border bg-muted/50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CodeBlockCodeProps extends React.HTMLProps<HTMLDivElement> {
  code: string
  language?: string
  theme?: string
  className?: string
}

export function CodeBlockCode({
  code,
  language = "tsx",
  theme = "github-dark",
  className,
  ...props
}: CodeBlockCodeProps) {
  const [html, setHtml] = React.useState<string>("")

  React.useEffect(() => {
    async function highlight() {
      try {
        const highlighted = await codeToHtml(code, {
          lang: language,
          theme: theme,
        })
        setHtml(highlighted)
      } catch (error) {
        // Fallback to plain text if language not supported
        setHtml(`<pre><code>${code}</code></pre>`)
      }
    }
    highlight()
  }, [code, language, theme])

  return (
    <div
      className={cn("overflow-x-auto p-4 text-sm [&_pre]:!bg-transparent [&_pre]:!p-0", className)}
      dangerouslySetInnerHTML={{ __html: html }}
      {...props}
    />
  )
}

interface CodeBlockGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function CodeBlockGroup({ children, className, ...props }: CodeBlockGroupProps) {
  return (
    <div className={cn("flex flex-col", className)} {...props}>
      {children}
    </div>
  )
}
