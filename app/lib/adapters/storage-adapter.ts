/**
 * Storage Adapter
 *
 * Dependency inversion for chat/message/settings persistence.
 * Swap between localStorage, API, database, etc. without changing app code.
 *
 * Currently using localStorage (via Zustand persist).
 * Ready to swap for Postgres, Supabase, Prisma, MongoDB, etc.
 */

import { Chat, Message, Artifact, AppSettings } from "@/types"

/**
 * Storage operations for a single chat
 */
export interface ChatOperations {
  /**
   * Get a single chat by ID
   */
  get(chatId: string): Promise<Chat | null>

  /**
   * Get all chats for current user
   * @param limit - Optional limit for pagination
   * @param offset - Optional offset for pagination
   */
  list(limit?: number, offset?: number): Promise<Chat[]>

  /**
   * Create a new chat
   */
  create(chat: Omit<Chat, "id" | "createdAt" | "updatedAt">): Promise<Chat>

  /**
   * Update an existing chat
   */
  update(chatId: string, updates: Partial<Chat>): Promise<Chat>

  /**
   * Delete a chat
   */
  delete(chatId: string): Promise<void>
}

/**
 * Storage operations for messages
 */
export interface MessageOperations {
  /**
   * Add a message to a chat
   */
  add(chatId: string, message: Omit<Message, "id" | "createdAt">): Promise<Message>

  /**
   * Update a message
   */
  update(chatId: string, messageId: string, updates: Partial<Message>): Promise<Message>

  /**
   * Delete a message
   */
  delete(chatId: string, messageId: string): Promise<void>

  /**
   * Get all messages for a chat
   */
  list(chatId: string): Promise<Message[]>
}

/**
 * Storage operations for artifacts
 */
export interface ArtifactOperations {
  /**
   * Add an artifact to a chat
   */
  add(chatId: string, artifact: Omit<Artifact, "id" | "createdAt" | "chatId">): Promise<Artifact>

  /**
   * Delete an artifact
   */
  delete(chatId: string, artifactId: string): Promise<void>

  /**
   * Get all artifacts for a chat
   */
  list(chatId: string): Promise<Artifact[]>
}

/**
 * Storage operations for settings
 */
export interface SettingsOperations {
  /**
   * Get user settings
   */
  get(): Promise<AppSettings>

  /**
   * Update user settings
   */
  update(settings: Partial<AppSettings>): Promise<AppSettings>
}

/**
 * Main storage adapter interface
 */
export interface StorageAdapter {
  /**
   * Initialize the storage adapter
   * Called once when app loads
   */
  initialize(): Promise<void>

  /**
   * Check if storage is ready
   */
  isReady(): boolean

  /**
   * Chat operations
   */
  chats: ChatOperations

  /**
   * Message operations
   */
  messages: MessageOperations

  /**
   * Artifact operations
   */
  artifacts: ArtifactOperations

  /**
   * Settings operations
   */
  settings: SettingsOperations

  /**
   * Clear all data (for logout/reset)
   */
  clearAll(): Promise<void>
}

/**
 * LocalStorage implementation (current default)
 *
 * This uses Zustand's built-in localStorage persistence.
 * It's simple but limited - no multi-device sync, no server-side storage.
 */
export class LocalStorageAdapter implements StorageAdapter {
  private ready = false
  public chats: ChatOperations
  public messages: MessageOperations
  public artifacts: ArtifactOperations
  public settings: SettingsOperations

  constructor() {
    // Bind methods to maintain 'this' context
    this.chats = {
      get: async (chatId: string) => {
        const state = this.getState()
        return state.chats.find((c: Chat) => c.id === chatId) || null
      },

      list: async () => {
        const state = this.getState()
        return state.chats
      },

      create: async (chat: Omit<Chat, "id" | "createdAt" | "updatedAt">) => {
        const newChat: Chat = {
          ...chat,
          id: this.generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        const state = this.getState()
        state.chats.unshift(newChat)
        this.setState(state)
        return newChat
      },

      update: async (chatId: string, updates: Partial<Chat>) => {
        const state = this.getState()
        const chatIndex = state.chats.findIndex((c: Chat) => c.id === chatId)
        if (chatIndex === -1) {
          throw new Error(`Chat ${chatId} not found`)
        }
        state.chats[chatIndex] = {
          ...state.chats[chatIndex],
          ...updates,
          updatedAt: new Date(),
        }
        this.setState(state)
        return state.chats[chatIndex]
      },

      delete: async (chatId: string) => {
        const state = this.getState()
        state.chats = state.chats.filter((c: Chat) => c.id !== chatId)
        this.setState(state)
      },
    }

    this.messages = {
      add: async (chatId: string, message: Omit<Message, "id" | "createdAt">) => {
        const newMessage: Message = {
          ...message,
          id: this.generateId(),
          createdAt: new Date(),
        }
        const state = this.getState()
        const chat = state.chats.find((c: Chat) => c.id === chatId)
        if (!chat) {
          throw new Error(`Chat ${chatId} not found`)
        }
        chat.messages.push(newMessage)
        chat.updatedAt = new Date()
        this.setState(state)
        return newMessage
      },

      update: async (chatId: string, messageId: string, updates: Partial<Message>) => {
        const state = this.getState()
        const chat = state.chats.find((c: Chat) => c.id === chatId)
        if (!chat) {
          throw new Error(`Chat ${chatId} not found`)
        }
        const messageIndex = chat.messages.findIndex((m: Message) => m.id === messageId)
        if (messageIndex === -1) {
          throw new Error(`Message ${messageId} not found`)
        }
        chat.messages[messageIndex] = {
          ...chat.messages[messageIndex],
          ...updates,
        }
        chat.updatedAt = new Date()
        this.setState(state)
        return chat.messages[messageIndex]
      },

      delete: async (chatId: string, messageId: string) => {
        const state = this.getState()
        const chat = state.chats.find((c: Chat) => c.id === chatId)
        if (!chat) {
          throw new Error(`Chat ${chatId} not found`)
        }
        chat.messages = chat.messages.filter((m: Message) => m.id !== messageId)
        chat.updatedAt = new Date()
        this.setState(state)
      },

      list: async (chatId: string) => {
        const state = this.getState()
        const chat = state.chats.find((c: Chat) => c.id === chatId)
        return chat?.messages || []
      },
    }

    this.artifacts = {
      add: async (chatId: string, artifact: Omit<Artifact, "id" | "createdAt" | "chatId">) => {
        const newArtifact: Artifact = {
          ...artifact,
          id: this.generateId(),
          createdAt: new Date(),
          chatId,
        }
        const state = this.getState()
        const chat = state.chats.find((c: Chat) => c.id === chatId)
        if (!chat) {
          throw new Error(`Chat ${chatId} not found`)
        }
        chat.artifacts.push(newArtifact)
        chat.updatedAt = new Date()
        this.setState(state)
        return newArtifact
      },

      delete: async (chatId: string, artifactId: string) => {
        const state = this.getState()
        const chat = state.chats.find((c: Chat) => c.id === chatId)
        if (!chat) {
          throw new Error(`Chat ${chatId} not found`)
        }
        chat.artifacts = chat.artifacts.filter((a: Artifact) => a.id !== artifactId)
        chat.updatedAt = new Date()
        this.setState(state)
      },

      list: async (chatId: string) => {
        const state = this.getState()
        const chat = state.chats.find((c: Chat) => c.id === chatId)
        return chat?.artifacts || []
      },
    }

    this.settings = {
      get: async () => {
        const state = this.getState()
        return state.settings
      },

      update: async (settings: Partial<AppSettings>) => {
        const state = this.getState()
        state.settings = { ...state.settings, ...settings }
        this.setState(state)
        return state.settings
      },
    }
  }

  async initialize(): Promise<void> {
    // Check if localStorage is available
    try {
      localStorage.setItem("__test__", "test")
      localStorage.removeItem("__test__")
      this.ready = true
    } catch (e) {
      console.error("localStorage not available:", e)
      this.ready = false
    }
  }

  isReady(): boolean {
    return this.ready
  }

  async clearAll(): Promise<void> {
    localStorage.removeItem("chat-storage")
  }

  // Helper methods
  private getState(): any {
    const stored = localStorage.getItem("chat-storage")
    if (!stored) {
      return { chats: [], settings: this.getDefaultSettings() }
    }
    try {
      const parsed = JSON.parse(stored)
      return parsed.state || parsed
    } catch (e) {
      return { chats: [], settings: this.getDefaultSettings() }
    }
  }

  private setState(state: any): void {
    localStorage.setItem("chat-storage", JSON.stringify({ state, version: 0 }))
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15)
  }

  private getDefaultSettings(): AppSettings {
    return {
      theme: "system",
      defaultProvider: "anthropic",
      defaultModel: "claude-3-5-sonnet-20241022",
      userAvatar: { style: "initials", value: "U" },
      apiKeys: {},
    }
  }
}

/**
 * Singleton instance - swap this out when implementing database storage
 */
export const storageAdapter: StorageAdapter = new LocalStorageAdapter()

/**
 * Example API-based implementation (for reference)
 *
 * When you want to use a database (Postgres, Supabase, etc.), implement like this:
 *
 * export class DatabaseStorageAdapter implements StorageAdapter {
 *   async initialize() {
 *     // Connect to database
 *     await connectToDatabase()
 *   }
 *
 *   chats: ChatOperations = {
 *     async get(chatId) {
 *       const response = await fetch(`/api/chats/${chatId}`)
 *       return response.json()
 *     },
 *
 *     async list() {
 *       const response = await fetch('/api/chats')
 *       return response.json()
 *     },
 *
 *     async create(chat) {
 *       const response = await fetch('/api/chats', {
 *         method: 'POST',
 *         body: JSON.stringify(chat)
 *       })
 *       return response.json()
 *     },
 *
 *     // ... etc
 *   }
 *
 *   messages: MessageOperations = {
 *     // Database operations for messages
 *   }
 *
 *   // ... etc
 * }
 *
 * Then swap the singleton:
 * export const storageAdapter: StorageAdapter = new DatabaseStorageAdapter()
 */
