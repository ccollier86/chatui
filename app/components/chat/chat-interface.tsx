"use client"

import * as React from "react"
import { toast } from "sonner"
import { useChatStore } from "@/lib/store"
import { Message, MessageAvatar, MessageContent, MessageActions, MessageAction } from "@/components/prompt-kit/message"
import { ChatContainerRoot, ChatContainerContent, ChatContainerScrollAnchor } from "@/components/prompt-kit/chat-container"
import { PromptInput, PromptInputTextarea, PromptInputActions, PromptInputAction } from "@/components/prompt-kit/prompt-input"
import { Loader } from "@/components/prompt-kit/loader"
import { ScrollButton } from "@/components/prompt-kit/scroll-button"
import { FileUpload, FileUploadTrigger, FileUploadContent } from "@/components/prompt-kit/file-upload"
import { UploadArtifactPreview, useUploadedFiles } from "@/components/prompt-kit/upload-artifact-preview"
import { PromptSuggestion } from "@/components/prompt-kit/prompt-suggestion"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Paperclip, Sparkles, Copy, RotateCw, Trash2, ArrowUp, Square } from "lucide-react"
import { cn } from "@/lib/utils"
import { Provider } from "@/types"
import { detectArtifacts, hasArtifacts } from "@/lib/artifact-detector"
import { parseAPIError, retryWithBackoff } from "@/lib/error-handler"
import { getProviderAvatar, getProviderFallback, getUserAvatar } from "@/lib/utils/avatar-utils"

export function ChatInterface() {
  const {
    currentChatId,
    getCurrentChat,
    addMessage,
    updateMessage,
    createChat,
    addArtifact,
    deleteMessage,
    fetchModels,
    settings,
  } = useChatStore()

  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [regeneratingMessageId, setRegeneratingMessageId] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const { uploadedFiles, addFiles, removeFile, clearFiles } = useUploadedFiles()

  const currentChat = getCurrentChat()

  // Fetch models on mount
  React.useEffect(() => {
    fetchModels()
  }, [fetchModels])

  // Ensure conversations open scrolled to the most recent message
  React.useEffect(() => {
    if (!currentChatId) return

    const frame = requestAnimationFrame(() => {
      const scrollContainer = document.querySelector<HTMLElement>('[data-scroll-container="true"]')
      scrollContainer?.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: "smooth",
      })
    })

    return () => cancelAnimationFrame(frame)
  }, [currentChatId])

  // Listen for focus input event
  React.useEffect(() => {
    const handleFocusInput = () => {
      inputRef.current?.focus()
    }
    window.addEventListener("focus-chat-input", handleFocusInput)
    return () => window.removeEventListener("focus-chat-input", handleFocusInput)
  }, [])

  // Handle file selection
  const handleFileSelect = (files: File[]) => {
    addFiles(files)
  }

  // Handle attach button click
  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      addFiles(files)
    }
    // Reset input so same file can be selected again
    e.target.value = ""
  }

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return

    let chatId = currentChatId
    if (!chatId) {
      chatId = createChat()
    }

    const userMessage = input.trim()
    setInput("")

    // Clear uploaded files after sending
    // TODO: In future, send files with the message
    clearFiles()

    // Add user message
    addMessage(chatId, {
      role: "user",
      content: userMessage,
      model: currentChat?.model,
      provider: currentChat?.provider,
    })

    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...(currentChat?.messages || []).map(m => ({
              role: m.role,
              content: m.content
            })),
            {
              role: "user",
              content: userMessage,
            },
          ],
          model: currentChat?.model || "claude-3-5-sonnet-20241022",
          provider: currentChat?.provider || "anthropic",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      // Handle AI SDK stream format
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ""
      let assistantMessageId: string | null = null

      // Add empty assistant message
      addMessage(chatId, {
        role: "assistant",
        content: "",
        model: currentChat?.model,
        provider: currentChat?.provider,
      })

      // Get the last message ID (the one we just added)
      const chat = getCurrentChat()
      if (chat && chat.messages.length > 0) {
        assistantMessageId = chat.messages[chat.messages.length - 1].id
      }

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("0:")) {
            // AI SDK stream format
            const data = line.slice(2)
            try {
              assistantMessage += data
              if (assistantMessageId) {
                updateMessage(chatId, assistantMessageId, assistantMessage)
              }
            } catch (e) {
              // Skip parsing errors
            }
          }
        }
      }

      // Auto-detect and create artifacts from the response
      if (assistantMessage && hasArtifacts(assistantMessage)) {
        const detectedArtifacts = detectArtifacts(assistantMessage)

        detectedArtifacts.forEach((artifact) => {
          addArtifact(chatId, {
            type: artifact.type,
            title: artifact.title,
            content: artifact.content,
            language: artifact.language,
          })
        })

        if (detectedArtifacts.length > 0) {
          toast.success(
            `Created ${detectedArtifacts.length} artifact${detectedArtifacts.length > 1 ? 's' : ''}`,
            {
              description: detectedArtifacts.map(a => a.title).join(", "),
            }
          )
        }
      }
    } catch (error) {
      console.error("Error:", error)
      const apiError = parseAPIError(error)

      toast.error(apiError.message, {
        description: apiError.suggestedAction,
        action: apiError.retryable ? {
          label: "Retry",
          onClick: () => {
            setInput(userMessage)
            setTimeout(() => handleSubmit(), 100)
          },
        } : undefined,
      })

      // Only add error message to chat if it's not retryable
      if (!apiError.retryable) {
        addMessage(chatId, {
          role: "assistant",
          content: `Error: ${apiError.message}. ${apiError.suggestedAction}`,
          model: currentChat?.model,
          provider: currentChat?.provider,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success("Copied to clipboard")
  }

  const handleDeleteMessage = (messageId: string) => {
    if (!currentChatId) return
    deleteMessage(currentChatId, messageId)
    toast.success("Message deleted")
  }

  const handleRegenerateResponse = async (messageId: string) => {
    if (!currentChatId || !currentChat) return

    setRegeneratingMessageId(messageId)

    // Find the index of the message being regenerated
    const messageIndex = currentChat.messages.findIndex((m) => m.id === messageId)
    if (messageIndex === -1) return

    // Get all messages up to (but not including) the message being regenerated
    const messagesUpToHere = currentChat.messages.slice(0, messageIndex)

    // The last user message should be the prompt
    const lastUserMessage = [...messagesUpToHere].reverse().find((m) => m.role === "user")
    if (!lastUserMessage) {
      toast.error("Cannot regenerate", { description: "No user message found" })
      setRegeneratingMessageId(null)
      return
    }

    try {
      // Delete the old assistant response
      deleteMessage(currentChatId, messageId)

      // Re-send the request
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messagesUpToHere.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model: currentChat.model || "claude-3-5-sonnet-20241022",
          provider: currentChat.provider || "anthropic",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to regenerate response")
      }

      // Add empty assistant message
      addMessage(currentChatId, {
        role: "assistant",
        content: "",
        model: currentChat.model,
        provider: currentChat.provider,
      })

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ""
      let assistantMessageId: string | null = null

      // Get the newly added message ID
      const chat = getCurrentChat()
      if (chat && chat.messages.length > 0) {
        assistantMessageId = chat.messages[chat.messages.length - 1].id
      }

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("0:")) {
            const data = line.slice(2)
            try {
              assistantMessage += data
              if (assistantMessageId) {
                updateMessage(currentChatId, assistantMessageId, assistantMessage)
              }
            } catch (e) {
              // Skip parsing errors
            }
          }
        }
      }

      // Auto-detect artifacts
      if (assistantMessage && hasArtifacts(assistantMessage)) {
        const detectedArtifacts = detectArtifacts(assistantMessage)

        detectedArtifacts.forEach((artifact) => {
          addArtifact(currentChatId, {
            type: artifact.type,
            title: artifact.title,
            content: artifact.content,
            language: artifact.language,
          })
        })

        if (detectedArtifacts.length > 0) {
          toast.success(
            `Created ${detectedArtifacts.length} artifact${detectedArtifacts.length > 1 ? 's' : ''}`,
            {
              description: detectedArtifacts.map((a) => a.title).join(", "),
            }
          )
        }
      }

      toast.success("Response regenerated")
    } catch (error) {
      console.error("Error:", error)
      const apiError = parseAPIError(error)

      toast.error(apiError.message, {
        description: apiError.suggestedAction,
        action: apiError.retryable ? {
          label: "Retry",
          onClick: () => handleRegenerateResponse(messageId),
        } : undefined,
      })
    } finally {
      setRegeneratingMessageId(null)
    }
  }

  if (!currentChatId) {
    return (
      <EmptyState
        onNewChat={() => createChat()}
        onSuggestionClick={(suggestion) => {
          const chatId = createChat()
          setInput(suggestion)
          // Focus input after creating chat
          setTimeout(() => inputRef.current?.focus(), 100)
        }}
      />
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Chat Header */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold" id="chat-title">{currentChat?.title || "New Chat"}</h2>
          <ModelSelector />
        </div>
      </div>

      {/* Messages */}
      <div className="relative flex-1 min-h-0">
        <ChatContainerRoot className="h-full" role="log" aria-live="polite" aria-atomic="false" aria-label="Chat messages">
          <ChatContainerContent className="space-y-6 pt-6 pb-32 min-h-full">
            {currentChat?.messages.map((message) => {
            // Get appropriate avatar based on role
            const avatarProps = message.role === "user"
              ? getUserAvatar(settings.userAvatar)
              : {
                  src: getProviderAvatar(message.provider || currentChat.provider, message.model || currentChat.model),
                  fallback: getProviderFallback(message.provider || currentChat.provider, message.model || currentChat.model),
                  className: "bg-background ring-2 ring-border text-foreground [&_img]:dark:brightness-0 [&_img]:dark:invert",
                }

            return (
              <Message
                key={message.id}
                className={cn(
                  "animate-slide-in-up",
                  message.role === "user" && "flex-row-reverse justify-start ml-auto max-w-[85%]",
                  message.role === "assistant" && "max-w-[90%]"
                )}
              >
                <MessageAvatar
                  {...avatarProps}
                  className={cn(avatarProps.className)}
                />
              <div className={cn(
                "flex-1 space-y-2",
                message.role === "user" && "flex-none"
              )}>
                <MessageContent
                  markdown
                  className={cn(
                    message.role === "user"
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-2xl px-4 py-3 shadow-md -mr-2"
                      : "bg-muted/40 rounded-2xl px-4 py-3 -ml-2 border border-border/30"
                  )}
                >
                  {message.content}
                </MessageContent>
                {/* Message Actions */}
                <MessageActions className={cn(
                  message.role === "user" && "flex-row-reverse"
                )}>
                  <MessageAction tooltip="Copy message">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleCopyMessage(message.content)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </MessageAction>
                  {message.role === "assistant" && (
                    <MessageAction tooltip="Regenerate response">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleRegenerateResponse(message.id)}
                        disabled={regeneratingMessageId === message.id}
                      >
                        <RotateCw className={cn(
                          "h-3.5 w-3.5",
                          regeneratingMessageId === message.id && "animate-spin"
                        )} />
                      </Button>
                    </MessageAction>
                  )}
                  <MessageAction tooltip="Delete message">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteMessage(message.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </MessageAction>
                </MessageActions>
              </div>
            </Message>
            )
          })}
          {isLoading && (
            <Message className="animate-slide-in-up">
              <MessageAvatar
                src={getProviderAvatar(currentChat?.provider || "anthropic", currentChat?.model)}
                fallback={getProviderFallback(currentChat?.provider || "anthropic", currentChat?.model)}
                className="bg-background ring-2 ring-border text-foreground [&_img]:dark:brightness-0 [&_img]:dark:invert"
              />
              <MessageContent>
                <Loader variant="typing" size="md" />
              </MessageContent>
            </Message>
          )}
          </ChatContainerContent>
          <ChatContainerScrollAnchor />

          {/* Scroll button */}
          <div className="pointer-events-none sticky bottom-28 z-30 flex justify-end px-4">
            <ScrollButton className="pointer-events-auto" />
          </div>

          {/* Subtle fade gradient (ChatGPT style) */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent z-10" />

          {/* Floating input container */}
          <FileUpload onFilesAdded={handleFileSelect} multiple accept="image/*,text/*,.pdf,.doc,.docx">
            <div className="sticky bottom-0 left-0 right-0 z-20 bg-background px-4 pb-4 pt-3">
              {/* Upload Artifacts Preview */}
              {uploadedFiles.length > 0 && (
                <div className="pb-2">
                  <UploadArtifactPreview files={uploadedFiles} onRemove={removeFile} />
                </div>
              )}

              {/* Prompt Input */}
              <PromptInput
                value={input}
                onValueChange={setInput}
                isLoading={isLoading}
                onSubmit={handleSubmit}
                className="rounded-3xl border border-border/50 bg-muted/50 shadow-sm"
              >
                <PromptInputTextarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="max-h-32"
                  aria-label="Chat message input"
                  aria-describedby="chat-title"
                />
                <PromptInputActions>
                  <PromptInputAction tooltip="Attach file">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label="Attach file"
                      onClick={handleAttachClick}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </PromptInputAction>
                  <div className="flex-1" />
                  <button
                    type="submit"
                    disabled={(!input.trim() && !isLoading) || false}
                    aria-label={isLoading ? "Stop generating" : "Send message"}
                    onClick={(e) => {
                      if (isLoading) {
                        e.preventDefault()
                        // TODO: Add stop generation logic
                      }
                    }}
                    className={cn(
                      "rounded-full flex items-center justify-center",
                      isLoading
                        ? "h-8 w-8 bg-red-600 hover:bg-red-700 text-white shadow-md animate-radial-pulse cursor-pointer transition-all duration-200"
                        : input.trim()
                        ? "h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer transition-all duration-500 ease-out"
                        : "h-8 w-8 bg-muted/80 text-foreground/40 cursor-not-allowed transition-all duration-500 ease-out"
                    )}
                  >
                    {isLoading ? (
                      <Square className="h-3 w-3 fill-current" />
                    ) : (
                      <ArrowUp className="h-4 w-4" />
                    )}
                  </button>
                </PromptInputActions>
              </PromptInput>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,text/*,.pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileInputChange}
              />
            </div>

            {/* Drag overlay */}
            <FileUploadContent />
          </FileUpload>
        </ChatContainerRoot>
      </div>
    </div>
  )
}

function EmptyState({
  onNewChat,
  onSuggestionClick,
}: {
  onNewChat: () => void
  onSuggestionClick: (suggestion: string) => void
}) {
  const suggestions = [
    "Explain quantum computing in simple terms",
    "Write a Python function to reverse a string",
    "What are the benefits of TypeScript over JavaScript?",
    "Help me debug a React component",
    "Create a REST API endpoint in Node.js",
    "Explain the difference between var, let, and const",
  ]

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <Sparkles className="h-12 w-12 text-muted-foreground" />
        <div>
          <h2 className="text-2xl font-semibold">Start a conversation</h2>
          <p className="text-muted-foreground">
            Choose a model and start chatting, or try a suggestion below
          </p>
        </div>
      </div>

      {/* Prompt Suggestions */}
      <div className="grid max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
        {suggestions.map((suggestion, index) => (
          <PromptSuggestion
            key={index}
            variant="outline"
            size="lg"
            className="h-auto whitespace-normal px-4 py-3 text-left font-normal"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </PromptSuggestion>
        ))}
      </div>

      <Button onClick={onNewChat} size="lg" variant="ghost">
        Or start a new chat
      </Button>
    </div>
  )
}

function ModelSelector() {
  const { getCurrentChat, currentChatId, chats, settings, availableModels } = useChatStore()
  const currentChat = getCurrentChat()

  const currentModel = availableModels.find((m) => m.id === currentChat?.model)

  const handleModelChange = (modelId: string) => {
    const model = availableModels.find((m) => m.id === modelId)
    if (!model || !currentChatId) return

    // Update the chat's model and provider
    useChatStore.setState((state) => ({
      chats: state.chats.map((c) =>
        c.id === currentChatId
          ? { ...c, model: model.id, provider: model.provider }
          : c
      ),
    }))

    toast.success("Model changed", {
      description: `Switched to ${model.name}`,
    })
  }

  // Group models by provider dynamically
  const modelsByProvider = availableModels.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = []
    }
    acc[model.provider].push(model)
    return acc
  }, {} as Record<string, typeof availableModels>)

  // Get unique providers in a consistent order
  const providers = Object.keys(modelsByProvider).sort((a, b) => {
    // Order: openai, anthropic, litellm, others
    const order = { openai: 0, anthropic: 1, litellm: 2 }
    const aOrder = order[a as keyof typeof order] ?? 99
    const bOrder = order[b as keyof typeof order] ?? 99
    if (aOrder !== bOrder) return aOrder - bOrder
    return a.localeCompare(b)
  })

  // Legacy grouping for backward compatibility
  const openAIModels = availableModels.filter((m) => m.provider === "openai")
  const anthropicModels = availableModels.filter((m) => m.provider === "anthropic")
  const litellmModels = availableModels.filter((m) => m.provider === "litellm")

  // Helper to capitalize provider names
  const formatProviderName = (provider: string) => {
    if (provider === "openai") return "OpenAI"
    if (provider === "anthropic") return "Anthropic"
    if (provider === "litellm") return "LiteLLM"
    return provider.charAt(0).toUpperCase() + provider.slice(1)
  }

  return (
    <Select
      value={currentChat?.model || settings.defaultModel}
      onValueChange={handleModelChange}
    >
      <SelectTrigger className="w-[200px] h-8">
        <SelectValue placeholder="Select model" />
      </SelectTrigger>
      <SelectContent>
        {providers.map((provider) => (
          <React.Fragment key={provider}>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              {formatProviderName(provider)}
            </div>
            {modelsByProvider[provider].map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </React.Fragment>
        ))}
      </SelectContent>
    </Select>
  )
}
