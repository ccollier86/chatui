"use client"

import * as React from "react"
import { X, File, FileText, Image as ImageIcon, FileCode, Type } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

// Base interface for uploaded items
export type UploadedItem = UploadedFile | UploadedPaste

// File upload type
export interface UploadedFile {
  id: string
  itemType: "file"
  file: File
  preview?: string
  type: "image" | "document" | "text" | "code"
}

// Paste artifact type
export interface UploadedPaste {
  id: string
  itemType: "paste"
  content: string
  lineCount: number
  pasteNumber: number
}

interface UploadArtifactPreviewProps {
  files: UploadedItem[]
  onRemove: (id: string) => void
  className?: string
}

export function UploadArtifactPreview({
  files,
  onRemove,
  className,
}: UploadArtifactPreviewProps) {
  if (files.length === 0) return null

  return (
    <div className={cn("border-t bg-muted/30 px-4 py-3", className)}>
      <ScrollArea className="w-full">
        <div className="flex gap-2">
          {files.map((item) => (
            <UploadArtifactItem
              key={item.id}
              item={item}
              onRemove={onRemove}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

interface UploadArtifactItemProps {
  item: UploadedItem
  onRemove: (id: string) => void
}

function UploadArtifactItem({ item, onRemove }: UploadArtifactItemProps) {
  const getIcon = (type: UploadedFile["type"]) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "code":
        return <FileCode className="h-4 w-4" />
      case "text":
        return <FileText className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  // Render paste artifact
  if (item.itemType === "paste") {
    return (
      <div className="relative flex-shrink-0">
        <div className="group relative flex h-24 w-24 flex-col items-center justify-center overflow-hidden rounded-lg border bg-background transition-colors hover:border-primary">
          {/* Remove button */}
          <Button
            variant="destructive"
            size="icon"
            className="absolute right-1 top-1 z-10 h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => onRemove(item.id)}
          >
            <X className="h-3 w-3" />
          </Button>

          {/* Paste icon and preview */}
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2">
            <Type className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div className="text-center text-[10px] font-medium">
              Paste {item.pasteNumber}
            </div>
          </div>
        </div>

        {/* Paste info */}
        <div className="mt-1 w-24">
          <div className="truncate text-xs font-medium">
            Paste {item.pasteNumber}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {item.lineCount} lines
          </div>
        </div>
      </div>
    )
  }

  // Render file artifact
  const { id, file, preview, type } = item

  return (
    <div className="relative flex-shrink-0">
      <div className="group relative flex h-24 w-24 flex-col items-center justify-center overflow-hidden rounded-lg border bg-background transition-colors hover:border-primary">
        {/* Remove button */}
        <Button
          variant="destructive"
          size="icon"
          className="absolute right-1 top-1 z-10 h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() => onRemove(id)}
        >
          <X className="h-3 w-3" />
        </Button>

        {/* Content */}
        {type === "image" && preview ? (
          <div className="relative h-full w-full">
            <img
              src={preview}
              alt={file.name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : type === "text" && preview ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2">
            <FileText className="h-6 w-6 text-muted-foreground" />
            <div className="line-clamp-2 text-center text-[10px] text-muted-foreground">
              {preview.substring(0, 50)}...
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2">
            {getIcon(type)}
            <div className="w-full truncate text-center text-[10px] font-medium">
              {file.name}
            </div>
          </div>
        )}
      </div>

      {/* File info */}
      <div className="mt-1 w-24">
        <div className="truncate text-xs font-medium" title={file.name}>
          {file.name}
        </div>
        <div className="text-[10px] text-muted-foreground">
          {formatFileSize(file.size)}
        </div>
      </div>
    </div>
  )
}

// Hook to manage uploaded files and paste artifacts
export function useUploadedFiles() {
  const [uploadedItems, setUploadedItems] = React.useState<UploadedItem[]>([])
  const [pasteCounter, setPasteCounter] = React.useState(0)

  const addFiles = React.useCallback(async (files: File[]) => {
    const newUploadedFiles: UploadedFile[] = await Promise.all(
      files.map(async (file) => {
        const id = crypto.randomUUID()
        let type: UploadedFile["type"] = "document"
        let preview: string | undefined

        // Determine type and create preview
        if (file.type.startsWith("image/")) {
          type = "image"
          preview = URL.createObjectURL(file)
        } else if (
          file.type === "text/plain" ||
          file.name.endsWith(".txt") ||
          file.name.endsWith(".md")
        ) {
          type = "text"
          try {
            const text = await file.text()
            preview = text
          } catch (e) {
            console.error("Failed to read text file:", e)
          }
        } else if (
          file.type.includes("javascript") ||
          file.type.includes("typescript") ||
          file.name.endsWith(".js") ||
          file.name.endsWith(".ts") ||
          file.name.endsWith(".tsx") ||
          file.name.endsWith(".jsx") ||
          file.name.endsWith(".py") ||
          file.name.endsWith(".java") ||
          file.name.endsWith(".cpp") ||
          file.name.endsWith(".c") ||
          file.name.endsWith(".go") ||
          file.name.endsWith(".rs")
        ) {
          type = "code"
        }

        return {
          id,
          itemType: "file" as const,
          file,
          preview,
          type,
        }
      })
    )

    setUploadedItems((prev) => [...prev, ...newUploadedFiles])
  }, [])

  const addPaste = React.useCallback((content: string, lineCount: number) => {
    const newPaste: UploadedPaste = {
      id: crypto.randomUUID(),
      itemType: "paste",
      content,
      lineCount,
      pasteNumber: pasteCounter + 1,
    }

    setUploadedItems((prev) => [...prev, newPaste])
    setPasteCounter((prev) => prev + 1)
  }, [pasteCounter])

  const removeItem = React.useCallback((id: string) => {
    setUploadedItems((prev) => {
      const item = prev.find((i) => i.id === id)
      // Revoke object URL if it's an image preview
      if (item?.itemType === "file" && item.preview && item.type === "image") {
        URL.revokeObjectURL(item.preview)
      }
      return prev.filter((i) => i.id !== id)
    })
  }, [])

  const clearAll = React.useCallback(() => {
    // Revoke all object URLs
    uploadedItems.forEach((item) => {
      if (item.itemType === "file" && item.preview && item.type === "image") {
        URL.revokeObjectURL(item.preview)
      }
    })
    setUploadedItems([])
    setPasteCounter(0)
  }, [uploadedItems])

  return {
    uploadedFiles: uploadedItems, // Keep old name for backward compatibility
    addFiles,
    addPaste,
    removeFile: removeItem, // Keep old name for backward compatibility
    clearFiles: clearAll, // Keep old name for backward compatibility
  }
}
