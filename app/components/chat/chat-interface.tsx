"use client"

import * as React from "react"
import { useChatStore } from "@/lib/store"
import { Message, MessageAvatar, MessageContent } from "@/components/prompt-kit/message"
import { ChatContainerRoot, ChatContainerContent, ChatContainerScrollAnchor } from "@/components/prompt-kit/chat-container"
import { PromptInput, PromptInputTextarea, PromptInputActions, PromptInputAction } from "@/components/prompt-kit/prompt-input"
import { Button } from "@/components/ui/button"
import { Send, Paperclip, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { AVAILABLE_MODELS } from "@/types"

export function ChatInterface() {
  const {
    currentChatId,
    getCurrentChat,
    addMessage,
    updateMessage,
    createChat,
  } = useChatStore()

  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

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
            ...(currentChat?.messages || []),
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
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") continue

            try {
              const json = JSON.parse(data)
              if (json.content) {
                assistantMessage += json.content
                if (assistantMessageId) {
                  updateMessage(chatId, assistantMessageId, assistantMessage)
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error)
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
              <MessageContent markdown>
                {message.content}
              </MessageContent>
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
  const { getCurrentChat, settings } = useChatStore()
  const currentChat = getCurrentChat()

  const currentModel = AVAILABLE_MODELS.find((m) => m.id === currentChat?.model)

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>{currentModel?.name || "Select Model"}</span>
    </div>
  )
}
