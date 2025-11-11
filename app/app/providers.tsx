"use client"

import * as React from "react"
import { ToastProvider } from "@/components/ui/toast-provider"
import { useChatStore } from "@/lib/store"

export function Providers({ children }: { children: React.ReactNode }) {
  const { settings } = useChatStore()

  React.useEffect(() => {
    const root = document.documentElement
    const theme = settings.theme

    // Remove existing theme classes
    root.classList.remove("light", "dark")

    // Apply theme
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [settings.theme])

  return (
    <>
      <ToastProvider />
      {children}
    </>
  )
}
