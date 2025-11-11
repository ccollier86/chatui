"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatShortcut } from "@/lib/use-keyboard-shortcuts"

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  const shortcuts = [
    {
      category: "General",
      items: [
        { keys: formatShortcut({ key: "N", ctrl: true }), description: "Create new chat" },
        { keys: formatShortcut({ key: "K", ctrl: true }), description: "Open settings" },
        { keys: formatShortcut({ key: "B", ctrl: true }), description: "Toggle artifacts panel" },
        { keys: formatShortcut({ key: "/" }), description: "Focus chat input" },
        { keys: "Escape", description: "Close dialogs" },
      ],
    },
    {
      category: "Chat",
      items: [
        { keys: "Enter", description: "Send message" },
        { keys: "Shift+Enter", description: "New line in message" },
      ],
    },
    {
      category: "Messages",
      items: [
        { keys: "Double-click", description: "Rename chat (in sidebar)" },
        { keys: "Hover", description: "Show message actions (copy, regenerate, delete)" },
      ],
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-md border px-4 py-2"
                  >
                    <span className="text-sm text-muted-foreground">
                      {shortcut.description}
                    </span>
                    <kbd className="rounded bg-muted px-2 py-1 text-xs font-mono font-semibold">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
