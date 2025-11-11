"use client"

import * as React from "react"
import { Sidebar } from "@/components/chat/sidebar"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ArtifactsPanel } from "@/components/chat/artifacts-panel"
import { useChatStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Settings, FileCode, Menu } from "lucide-react"
import { SettingsDialog } from "@/components/chat/settings-dialog"

export default function Home() {
  const [sidebarMinimized, setSidebarMinimized] = React.useState(false)
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [showSettings, setShowSettings] = React.useState(false)
  const { isArtifactsPanelOpen, toggleArtifactsPanel } = useChatStore()

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
            >
              <FileCode className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="h-8 w-8"
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
    </div>
  )
}
