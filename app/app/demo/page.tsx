"use client"

import * as React from "react"
import { Sidebar } from "@/components/chat/sidebar"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ArtifactsPanel } from "@/components/chat/artifacts-panel"
import { useChatStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Settings, FileCode, Menu, Info } from "lucide-react"
import { SettingsDialog } from "@/components/chat/settings-dialog"
import { KeyboardShortcutsDialog } from "@/components/chat/keyboard-shortcuts-dialog"
import { useKeyboardShortcuts } from "@/lib/use-keyboard-shortcuts"
import { toast } from "sonner"
import { demoChats, demoSettings } from "./demo-data"
import Link from "next/link"

export default function DemoPage() {
  const [sidebarMinimized, setSidebarMinimized] = React.useState(false)
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [showSettings, setShowSettings] = React.useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  const {
    isArtifactsPanelOpen,
    toggleArtifactsPanel,
    createChat,
    setCurrentChat,
    updateSettings,
  } = useChatStore()

  // Initialize demo data on client only
  React.useEffect(() => {
    // Clear any existing persisted data and load demo data
    useChatStore.setState({
      chats: demoChats,
      currentChatId: demoChats[0].id,
      settings: demoSettings,
      availableModels: [
        {
          id: "gpt-4-turbo-preview",
          name: "GPT-4 Turbo",
          provider: "openai",
          contextWindow: 128000,
        },
        {
          id: "claude-3-5-sonnet-20241022",
          name: "Claude 3.5 Sonnet",
          provider: "anthropic",
          contextWindow: 200000,
        },
      ],
    })

    setMounted(true)

    // Show welcome message after a brief delay
    setTimeout(() => {
      toast.info("Demo Mode: Explore the interface with sample conversations", {
        duration: 5000,
      })
    }, 100)
  }, [])

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "n",
      ctrl: true,
      handler: () => {
        toast.info("Demo Mode: New chat creation is disabled")
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
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Demo Banner */}
      <div className="flex items-center justify-between border-b bg-blue-50 px-4 py-2 dark:bg-blue-950/20">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Demo Mode - Explore the interface with sample data
          </p>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm">
            Exit Demo
          </Button>
        </Link>
      </div>

      {!mounted ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="text-sm text-muted-foreground">Loading demo...</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
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
            style={{ marginTop: sidebarOpen ? "0" : undefined }}
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
                Catalyst Chat UI - Demo
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
        </div>
      )}

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
