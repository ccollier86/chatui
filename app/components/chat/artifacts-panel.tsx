"use client"

import * as React from "react"
import { useChatStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { CodeBlock, CodeBlockCode } from "@/components/prompt-kit/code-block"
import { Markdown } from "@/components/prompt-kit/markdown"
import { X, Copy, Download, FileCode, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

export function ArtifactsPanel() {
  const { selectedArtifact, isArtifactsPanelOpen, setSelectedArtifact, toggleArtifactsPanel, getCurrentChat } =
    useChatStore()

  const currentChat = getCurrentChat()
  const artifacts = currentChat?.artifacts || []

  if (!isArtifactsPanelOpen) return null

  const handleCopy = () => {
    if (selectedArtifact) {
      navigator.clipboard.writeText(selectedArtifact.content)
    }
  }

  const handleDownload = () => {
    if (!selectedArtifact) return

    const blob = new Blob([selectedArtifact.content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${selectedArtifact.title}.${selectedArtifact.language || "txt"}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className={cn("flex h-full w-96 flex-col border-l bg-background")}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="font-semibold">Artifacts</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleArtifactsPanel}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Artifacts List */}
      {artifacts.length > 0 && (
        <div className="border-b">
          <ScrollArea className="h-32">
            <div className="space-y-1 p-2">
              {artifacts.map((artifact) => (
                <Button
                  key={artifact.id}
                  variant={selectedArtifact?.id === artifact.id ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => setSelectedArtifact(artifact)}
                >
                  {artifact.type === "code" ? (
                    <FileCode className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  <span className="truncate">{artifact.title}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Artifact Content */}
      <div className="flex-1 overflow-hidden">
        {selectedArtifact ? (
          <>
            <div className="flex items-center justify-between border-b px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{selectedArtifact.title}</span>
                {selectedArtifact.language && (
                  <span className="rounded bg-muted px-2 py-0.5 text-xs">
                    {selectedArtifact.language}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="h-7 w-7"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDownload}
                  className="h-7 w-7"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <ScrollArea className="h-full p-4">
              {selectedArtifact.type === "code" ? (
                <CodeBlock>
                  <CodeBlockCode
                    code={selectedArtifact.content}
                    language={selectedArtifact.language || "typescript"}
                  />
                </CodeBlock>
              ) : selectedArtifact.type === "document" ? (
                <Markdown>{selectedArtifact.content}</Markdown>
              ) : (
                <div className="whitespace-pre-wrap text-sm">
                  {selectedArtifact.content}
                </div>
              )}
            </ScrollArea>
          </>
        ) : artifacts.length > 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Select an artifact to view
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <FileCode className="h-12 w-12" />
            <div>
              <p className="font-medium">No artifacts yet</p>
              <p className="text-xs">
                Generated code and documents will appear here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
