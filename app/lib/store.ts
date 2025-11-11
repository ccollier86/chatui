import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Chat, Message, Artifact, AppSettings, Provider, AVAILABLE_MODELS } from "@/types"

interface ChatState {
  chats: Chat[]
  currentChatId: string | null
  settings: AppSettings
  selectedArtifact: Artifact | null
  isArtifactsPanelOpen: boolean

  // Chat actions
  createChat: (model?: string, provider?: Provider) => string
  deleteChat: (chatId: string) => void
  setCurrentChat: (chatId: string | null) => void
  updateChatTitle: (chatId: string, title: string) => void

  // Message actions
  addMessage: (chatId: string, message: Omit<Message, "id" | "createdAt">) => void
  updateMessage: (chatId: string, messageId: string, content: string) => void
  deleteMessage: (chatId: string, messageId: string) => void

  // Artifact actions
  addArtifact: (chatId: string, artifact: Omit<Artifact, "id" | "createdAt" | "chatId">) => void
  setSelectedArtifact: (artifact: Artifact | null) => void
  toggleArtifactsPanel: () => void

  // Settings actions
  updateSettings: (settings: Partial<AppSettings>) => void

  // Getters
  getCurrentChat: () => Chat | null
  getChatsByRecency: () => Chat[]
}

const generateId = () => Math.random().toString(36).substring(2, 15)

const generateChatTitle = (firstMessage?: string): string => {
  if (!firstMessage) return "New Chat"
  const words = firstMessage.split(" ").slice(0, 5)
  return words.join(" ") + (firstMessage.split(" ").length > 5 ? "..." : "")
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,
      settings: {
        theme: "system",
        defaultProvider: "anthropic",
        defaultModel: "claude-3-5-sonnet-20241022",
        apiKeys: {},
      },
      selectedArtifact: null,
      isArtifactsPanelOpen: false,

      createChat: (model, provider) => {
        const newChat: Chat = {
          id: generateId(),
          title: "New Chat",
          messages: [],
          model: model || get().settings.defaultModel,
          provider: provider || get().settings.defaultProvider,
          createdAt: new Date(),
          updatedAt: new Date(),
          artifacts: [],
        }

        set((state) => ({
          chats: [newChat, ...state.chats],
          currentChatId: newChat.id,
        }))

        return newChat.id
      },

      deleteChat: (chatId) => {
        set((state) => ({
          chats: state.chats.filter((c) => c.id !== chatId),
          currentChatId: state.currentChatId === chatId ? null : state.currentChatId,
        }))
      },

      setCurrentChat: (chatId) => {
        set({ currentChatId: chatId })
      },

      updateChatTitle: (chatId, title) => {
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId ? { ...c, title, updatedAt: new Date() } : c
          ),
        }))
      },

      addMessage: (chatId, message) => {
        const newMessage: Message = {
          ...message,
          id: generateId(),
          createdAt: new Date(),
        }

        set((state) => {
          const chats = state.chats.map((c) => {
            if (c.id === chatId) {
              const updatedMessages = [...c.messages, newMessage]
              const title = c.messages.length === 0 && message.role === "user"
                ? generateChatTitle(message.content)
                : c.title

              return {
                ...c,
                messages: updatedMessages,
                title,
                updatedAt: new Date(),
              }
            }
            return c
          })

          return { chats }
        })
      },

      updateMessage: (chatId, messageId, content) => {
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId ? { ...m, content } : m
                  ),
                  updatedAt: new Date(),
                }
              : c
          ),
        }))
      },

      deleteMessage: (chatId, messageId) => {
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: c.messages.filter((m) => m.id !== messageId),
                  updatedAt: new Date(),
                }
              : c
          ),
        }))
      },

      addArtifact: (chatId, artifact) => {
        const newArtifact: Artifact = {
          ...artifact,
          id: generateId(),
          createdAt: new Date(),
          chatId,
        }

        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  artifacts: [...c.artifacts, newArtifact],
                  updatedAt: new Date(),
                }
              : c
          ),
          selectedArtifact: newArtifact,
          isArtifactsPanelOpen: true,
        }))
      },

      setSelectedArtifact: (artifact) => {
        set({ selectedArtifact: artifact })
      },

      toggleArtifactsPanel: () => {
        set((state) => ({ isArtifactsPanelOpen: !state.isArtifactsPanelOpen }))
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }))
      },

      getCurrentChat: () => {
        const state = get()
        return state.chats.find((c) => c.id === state.currentChatId) || null
      },

      getChatsByRecency: () => {
        return get().chats.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      },
    }),
    {
      name: "chat-storage",
    }
  )
)
