"use client"

import * as React from "react"
import { useChatStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  PlusCircle,
  MessageSquare,
  FolderOpen,
  FileCode,
  Code,
  ChevronDown,
  Minimize2,
  MoreHorizontal,
  Trash2,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

interface SidebarProps {
  className?: string
  onToggle?: () => void
  isMinimized?: boolean
}

export function Sidebar({ className, onToggle, isMinimized }: SidebarProps) {
  const { chats, currentChatId, createChat, setCurrentChat, deleteChat, getChatsByRecency } =
    useChatStore()

  const recentChats = React.useMemo(() => getChatsByRecency(), [chats])

  const handleNewChat = () => {
    const newChatId = createChat()
    setCurrentChat(newChatId)
  }

  if (isMinimized) {
    return (
      <div className={cn("flex h-full w-16 flex-col border-r bg-background", className)}>
        <div className="flex items-center justify-center p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            <Code className="h-5 w-5" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex h-full w-64 flex-col border-r bg-background", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold">LM Chat</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8"
        >
          <Minimize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="px-3 pb-2">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary/20"
          variant="ghost"
        >
          <PlusCircle className="h-4 w-4" />
          New chat
        </Button>
      </div>

      {/* Navigation */}
      <div className="space-y-1 px-3 py-2">
        <SidebarNavItem icon={MessageSquare} label="Chats" active />
        <SidebarNavItem icon={FolderOpen} label="Projects" />
        <SidebarNavItem icon={FileCode} label="Artifacts" />
        <SidebarNavItem icon={Code} label="Code" />
      </div>

      <Separator className="my-2" />

      {/* Recents */}
      <div className="flex-1 overflow-hidden">
        <div className="px-3 py-2">
          <h3 className="mb-2 text-xs font-semibold text-muted-foreground">Recents</h3>
        </div>
        <ScrollArea className="h-full px-2">
          <div className="space-y-1 pb-4">
            {recentChats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === currentChatId}
                onClick={() => setCurrentChat(chat.id)}
                onDelete={() => deleteChat(chat.id)}
              />
            ))}
            {recentChats.length === 0 && (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                No chats yet. Start a new conversation!
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <Separator className="my-2" />

      {/* User Profile */}
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <span className="text-xs font-semibold">U</span>
            </div>
            <div className="flex flex-col items-start text-xs">
              <span className="font-medium">User</span>
              <span className="text-muted-foreground">Free plan</span>
            </div>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

interface SidebarNavItemProps {
  icon: React.ElementType
  label: string
  active?: boolean
}

function SidebarNavItem({ icon: Icon, label, active }: SidebarNavItemProps) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-2",
        active && "bg-accent"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  )
}

interface ChatItemProps {
  chat: any
  isActive: boolean
  onClick: () => void
  onDelete: () => void
}

function ChatItem({ chat, isActive, onClick, onDelete }: ChatItemProps) {
  const [showActions, setShowActions] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [editedTitle, setEditedTitle] = React.useState(chat.title)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const { updateChatTitle } = useChatStore()

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
    setEditedTitle(chat.title)
  }

  const handleSave = () => {
    const trimmedTitle = editedTitle.trim()
    if (trimmedTitle && trimmedTitle !== chat.title) {
      updateChatTitle(chat.id, trimmedTitle)
      toast.success("Chat renamed", {
        description: `Renamed to "${trimmedTitle}"`,
      })
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedTitle(chat.title)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent cursor-pointer",
        isActive && "bg-accent"
      )}
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex-1 truncate">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded border border-input bg-background px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          />
        ) : (
          <div
            className="truncate font-medium"
            onDoubleClick={handleDoubleClick}
            title="Double-click to rename"
          >
            {chat.title}
          </div>
        )}
        <div className="text-xs text-muted-foreground">
          {chat.messages.length} messages
        </div>
      </div>
      {showActions && !isEditing && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              // Open more options
            }}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  )
}
