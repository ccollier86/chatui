"use client"

import * as React from "react"
import { Sidebar } from "@/components/chat/sidebar"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ArtifactsPanel } from "@/components/chat/artifacts-panel"
import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle"
import { useChatStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Settings, FileCode, Menu } from "lucide-react"
import { SettingsDialog } from "@/components/chat/settings-dialog"
import { KeyboardShortcutsDialog } from "@/components/chat/keyboard-shortcuts-dialog"
import { useKeyboardShortcuts } from "@/lib/use-keyboard-shortcuts"
import { toast } from "sonner"

export default function Home() {
  const [sidebarMinimized, setSidebarMinimized] = React.useState(false)
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [showSettings, setShowSettings] = React.useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = React.useState(false)
  const { isArtifactsPanelOpen, toggleArtifactsPanel, createChat, setCurrentChat } = useChatStore()

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "n",
      ctrl: true,
      handler: () => {
        const newChatId = createChat()
        setCurrentChat(newChatId)
        toast.success("New chat created")
      },
      description: "Create new chat",
    },
    {
      key: "k",
      ctrl: true,
      handler: () => {
        setShowSettings(true)
      },
      description: "Open settings",
    },
    {
      key: "b",
      ctrl: true,
      handler: () => {
        toggleArtifactsPanel()
        toast.success(isArtifactsPanelOpen ? "Artifacts panel closed" : "Artifacts panel opened")
      },
      description: "Toggle artifacts panel",
    },
    {
      key: "/",
      handler: () => {
        // Dispatch custom event to focus chat input
        window.dispatchEvent(new CustomEvent("focus-chat-input"))
      },
      description: "Focus chat input",
    },
    {
      key: "?",
      shift: true,
      handler: () => {
        setShowKeyboardShortcuts(true)
      },
      description: "Show keyboard shortcuts",
    },
    {
      key: "Escape",
      handler: () => {
        if (showSettings) {
          setShowSettings(false)
        }
        if (showKeyboardShortcuts) {
          setShowKeyboardShortcuts(false)
        }
        if (sidebarOpen) {
          setSidebarOpen(false)
        }
      },
      description: "Close dialogs",
    },
  ])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          isMinimized={sidebarMinimized}
          onToggle={() => {
            setSidebarMinimized(!sidebarMinimized)
            setSidebarOpen(false)
          }}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b px-4 py-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="h-8 w-8 lg:hidden"
              aria-label="Open sidebar"
              aria-expanded={sidebarOpen}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-sm font-medium text-muted-foreground">
              AI Chat Interface
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleArtifactsPanel}
              className="h-8 w-8"
              aria-label="Toggle artifacts panel"
              aria-pressed={isArtifactsPanelOpen}
            >
              <FileCode className="h-4 w-4" />
            </Button>
            <AnimatedThemeToggle className="h-8 w-8" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="h-8 w-8"
              aria-label="Open settings"
              aria-haspopup="dialog"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface />
        </div>
      </div>

      {/* Artifacts Panel */}
      <ArtifactsPanel />

      {/* Settings Dialog */}
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog
        open={showKeyboardShortcuts}
        onOpenChange={setShowKeyboardShortcuts}
      />
    </div>
  )
}
