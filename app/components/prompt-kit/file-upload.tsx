"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface FileUploadContextValue {
  onFilesAdded: (files: File[]) => void
  isDragging: boolean
  multiple: boolean
  accept?: string
}

const FileUploadContext = React.createContext<FileUploadContextValue | null>(null)

interface FileUploadProps {
  onFilesAdded: (files: File[]) => void
  children: React.ReactNode
  multiple?: boolean
  accept?: string
}

export function FileUpload({
  onFilesAdded,
  children,
  multiple = true,
  accept,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const dragCounter = React.useRef(0)

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounter.current = 0

    const files = Array.from(e.dataTransfer?.files || [])
    if (files.length > 0) {
      onFilesAdded(files)
    }
  }

  React.useEffect(() => {
    const element = document.body

    element.addEventListener("dragenter", handleDragEnter)
    element.addEventListener("dragleave", handleDragLeave)
    element.addEventListener("dragover", handleDragOver)
    element.addEventListener("drop", handleDrop)

    return () => {
      element.removeEventListener("dragenter", handleDragEnter)
      element.removeEventListener("dragleave", handleDragLeave)
      element.removeEventListener("dragover", handleDragOver)
      element.removeEventListener("drop", handleDrop)
    }
  }, [onFilesAdded])

  return (
    <FileUploadContext.Provider value={{ onFilesAdded, isDragging, multiple, accept }}>
      {children}
    </FileUploadContext.Provider>
  )
}

interface FileUploadTriggerProps extends React.ComponentPropsWithoutRef<"button"> {
  asChild?: boolean
  children: React.ReactNode
}

export function FileUploadTrigger({
  asChild = false,
  className,
  children,
  ...props
}: FileUploadTriggerProps) {
  const context = React.useContext(FileUploadContext)
  const inputRef = React.useRef<HTMLInputElement>(null)

  if (!context) {
    throw new Error("FileUploadTrigger must be used within FileUpload")
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      context.onFilesAdded(files)
    }
    // Reset input so same file can be selected again
    e.target.value = ""
  }

  if (asChild) {
    return (
      <>
        <div onClick={handleClick} className={className}>
          {children}
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple={context.multiple}
          accept={context.accept}
          onChange={handleChange}
          className="hidden"
        />
      </>
    )
  }

  return (
    <>
      <button onClick={handleClick} className={className} {...props}>
        {children}
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple={context.multiple}
        accept={context.accept}
        onChange={handleChange}
        className="hidden"
      />
    </>
  )
}

interface FileUploadContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function FileUploadContent({
  className,
  ...props
}: FileUploadContentProps) {
  const context = React.useContext(FileUploadContext)

  if (!context) {
    throw new Error("FileUploadContent must be used within FileUpload")
  }

  if (!context.isDragging) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      <div className="rounded-lg border-2 border-dashed border-primary bg-background p-8 text-center">
        <p className="text-lg font-medium">Drop files here to upload</p>
      </div>
    </div>
  )
}
