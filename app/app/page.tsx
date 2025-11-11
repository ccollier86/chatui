"use client"

import * as React from "react"
import { Sidebar } from "@/components/chat/sidebar"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ArtifactsPanel } from "@/components/chat/artifacts-panel"
import { useChatStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Settings, FileCode } from "lucide-react"
import { SettingsDialog } from "@/components/chat/settings-dialog"

export default function Home() {
  const [sidebarMinimized, setSidebarMinimized] = React.useState(false)
  const [showSettings, setShowSettings] = React.useState(false)
  const { isArtifactsPanelOpen, toggleArtifactsPanel } = useChatStore()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        isMinimized={sidebarMinimized}
        onToggle={() => setSidebarMinimized(!sidebarMinimized)}
      />

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b px-4 py-2">
          <div className="flex items-center gap-2">
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
