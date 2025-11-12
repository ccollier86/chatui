"use client"

import * as React from "react"
import { X, File, FileText, Image as ImageIcon, FileCode } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export interface UploadedFile {
  id: string
  file: File
  preview?: string
  type: "image" | "document" | "text" | "code"
}

interface UploadArtifactPreviewProps {
  files: UploadedFile[]
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
          {files.map((uploadedFile) => (
            <UploadArtifactItem
              key={uploadedFile.id}
              uploadedFile={uploadedFile}
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
  uploadedFile: UploadedFile
  onRemove: (id: string) => void
}

function UploadArtifactItem({ uploadedFile, onRemove }: UploadArtifactItemProps) {
  const { id, file, preview, type } = uploadedFile

  const getIcon = () => {
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
            {getIcon()}
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

// Hook to convert files to UploadedFile format
export function useUploadedFiles() {
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([])

  const addFiles = React.useCallback(async (files: File[]) => {
    const newUploadedFiles = await Promise.all(
      files.map(async (file) => {
        const id = Math.random().toString(36).substring(7)
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
          file,
          preview,
          type,
        }
      })
    )

    setUploadedFiles((prev) => [...prev, ...newUploadedFiles])
  }, [])

  const removeFile = React.useCallback((id: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      // Revoke object URL if it's an image preview
      if (file?.preview && file.type === "image") {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter((f) => f.id !== id)
    })
  }, [])

  const clearFiles = React.useCallback(() => {
    // Revoke all object URLs
    uploadedFiles.forEach((file) => {
      if (file.preview && file.type === "image") {
        URL.revokeObjectURL(file.preview)
      }
    })
    setUploadedFiles([])
  }, [uploadedFiles])

  return {
    uploadedFiles,
    addFiles,
    removeFile,
    clearFiles,
  }
}
