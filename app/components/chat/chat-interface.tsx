"use client"

import * as React from "react"
import { toast } from "sonner"
import { useChatStore } from "@/lib/store"
import { Message, MessageAvatar, MessageContent } from "@/components/prompt-kit/message"
import { ChatContainerRoot, ChatContainerContent, ChatContainerScrollAnchor } from "@/components/prompt-kit/chat-container"
import { PromptInput, PromptInputTextarea, PromptInputActions, PromptInputAction } from "@/components/prompt-kit/prompt-input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Send, Paperclip, Sparkles, Copy, RotateCw, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { AVAILABLE_MODELS, Provider } from "@/types"
import { detectArtifacts, hasArtifacts } from "@/lib/artifact-detector"

export function ChatInterface() {
  const {
    currentChatId,
    getCurrentChat,
    addMessage,
    updateMessage,
    createChat,
    addArtifact,
    deleteMessage,
  } = useChatStore()

  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [regeneratingMessageId, setRegeneratingMessageId] = React.useState<string | null>(null)

  const currentChat = getCurrentChat()

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return

    let chatId = currentChatId
    if (!chatId) {
      chatId = createChat()
    }

    const userMessage = input.trim()
    setInput("")

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
      toast.error("Failed to get response", {
        description: error instanceof Error ? error.message : "Please try again",
      })
      addMessage(chatId, {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        model: currentChat?.model,
        provider: currentChat?.provider,
      })
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
      toast.error("Failed to regenerate", {
        description: error instanceof Error ? error.message : "Please try again",
      })
    } finally {
      setRegeneratingMessageId(null)
    }
  }

  if (!currentChatId) {
    return <EmptyState onNewChat={() => createChat()} />
  }

  return (
    <div className="flex h-full flex-col">
      {/* Chat Header */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{currentChat?.title || "New Chat"}</h2>
          <ModelSelector />
        </div>
      </div>

      {/* Messages */}
      <ChatContainerRoot className="flex-1">
        <ChatContainerContent className="space-y-6 py-6">
          {currentChat?.messages.map((message) => (
            <Message key={message.id}>
              <MessageAvatar
                fallback={message.role === "user" ? "U" : "AI"}
                className={cn(
                  message.role === "assistant" && "bg-primary text-primary-foreground"
                )}
              />
              <div className="flex-1 space-y-2">
                <MessageContent markdown>
                  {message.content}
                </MessageContent>
                {/* Message Actions */}
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleCopyMessage(message.content)}
                    title="Copy message"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  {message.role === "assistant" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleRegenerateResponse(message.id)}
                      disabled={regeneratingMessageId === message.id}
                      title="Regenerate response"
                    >
                      <RotateCw className={cn(
                        "h-3.5 w-3.5",
                        regeneratingMessageId === message.id && "animate-spin"
                      )} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteMessage(message.id)}
                    title="Delete message"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Message>
          ))}
          {isLoading && (
            <Message>
              <MessageAvatar
                fallback="AI"
                className="bg-primary text-primary-foreground"
              />
              <MessageContent>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "300ms" }} />
                </div>
              </MessageContent>
            </Message>
          )}
        </ChatContainerContent>
        <ChatContainerScrollAnchor />
      </ChatContainerRoot>

      {/* Input */}
      <div className="border-t p-4">
        <PromptInput
          value={input}
          onValueChange={setInput}
          isLoading={isLoading}
          onSubmit={handleSubmit}
        >
          <PromptInputTextarea
            placeholder="Type a message..."
            className="max-h-32"
          />
          <PromptInputActions>
            <PromptInputAction tooltip="Attach file">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Paperclip className="h-4 w-4" />
              </Button>
            </PromptInputAction>
            <div className="flex-1" />
            <Button
              type="submit"
              size="icon"
              className="h-8 w-8"
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </PromptInputActions>
        </PromptInput>
      </div>
    </div>
  )
}

function EmptyState({ onNewChat }: { onNewChat: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <Sparkles className="h-12 w-12 text-muted-foreground" />
      <div>
        <h2 className="text-2xl font-semibold">Start a conversation</h2>
        <p className="text-muted-foreground">
          Choose a model and start chatting
        </p>
      </div>
      <Button onClick={onNewChat} size="lg">
        New Chat
      </Button>
    </div>
  )
}

function ModelSelector() {
  const { getCurrentChat, currentChatId, chats, settings } = useChatStore()
  const currentChat = getCurrentChat()

  const currentModel = AVAILABLE_MODELS.find((m) => m.id === currentChat?.model)

  const handleModelChange = (modelId: string) => {
    const model = AVAILABLE_MODELS.find((m) => m.id === modelId)
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

  // Group models by provider
  const openAIModels = AVAILABLE_MODELS.filter((m) => m.provider === "openai")
  const anthropicModels = AVAILABLE_MODELS.filter((m) => m.provider === "anthropic")

  return (
    <Select
      value={currentChat?.model || settings.defaultModel}
      onValueChange={handleModelChange}
    >
      <SelectTrigger className="w-[200px] h-8">
        <SelectValue placeholder="Select model" />
      </SelectTrigger>
      <SelectContent>
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          OpenAI
        </div>
        {openAIModels.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            {model.name}
          </SelectItem>
        ))}
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          Anthropic
        </div>
        {anthropicModels.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
