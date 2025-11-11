import { useEffect } from "react"

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
  handler: () => void
  description: string
}

/**
 * Custom hook for registering keyboard shortcuts
 * Handles both Ctrl (Windows/Linux) and Cmd (Mac) modifiers
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlPressed = shortcut.ctrl && (event.ctrlKey || event.metaKey)
        const metaPressed = shortcut.meta && (event.metaKey || event.ctrlKey)
        const shiftPressed = shortcut.shift ? event.shiftKey : !event.shiftKey
        const altPressed = shortcut.alt ? event.altKey : !event.altKey

        // Check if the key matches and all modifiers are correct
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const modifiersMatch =
          (shortcut.ctrl ? ctrlPressed : !event.ctrlKey && !event.metaKey) &&
          (shortcut.meta ? metaPressed : !event.metaKey && !event.ctrlKey) &&
          shiftPressed &&
          altPressed

        if (keyMatches && modifiersMatch) {
          // Don't trigger if user is typing in an input/textarea
          const target = event.target as HTMLElement
          const isInput =
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.contentEditable === "true"

          // Exception: Allow "/" to focus input even when not in an input
          if (shortcut.key === "/" && !isInput) {
            event.preventDefault()
            shortcut.handler()
            return
          }

          // For other shortcuts, don't trigger if in an input
          if (!isInput) {
            event.preventDefault()
            shortcut.handler()
            return
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts])
}

/**
 * Helper to format keyboard shortcut for display
 */
export function formatShortcut(shortcut: Pick<KeyboardShortcut, "key" | "ctrl" | "meta" | "shift" | "alt">): string {
  const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0
  const parts: string[] = []

  if (shortcut.ctrl || shortcut.meta) {
    parts.push(isMac ? "⌘" : "Ctrl")
  }
  if (shortcut.shift) {
    parts.push(isMac ? "⇧" : "Shift")
  }
  if (shortcut.alt) {
    parts.push(isMac ? "⌥" : "Alt")
  }

  parts.push(shortcut.key.toUpperCase())

  return parts.join("+")
}
