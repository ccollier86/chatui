export type Role = "user" | "assistant" | "system"

export type Provider = "openai" | "anthropic"

export interface Model {
  id: string
  name: string
  provider: Provider
  contextWindow: number
}

export interface Message {
  id: string
  role: Role
  content: string
  createdAt: Date
  model?: string
  provider?: Provider
}

export interface Artifact {
  id: string
  type: "code" | "document" | "jsx"
  title: string
  content: string
  language?: string
  createdAt: Date
  chatId: string
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  model: string
  provider: Provider
  createdAt: Date
  updatedAt: Date
  artifacts: Artifact[]
}

export interface AppSettings {
  theme: "light" | "dark" | "system"
  defaultProvider: Provider
  defaultModel: string
  apiKeys: {
    openai?: string
    anthropic?: string
  }
}

export const AVAILABLE_MODELS: Model[] = [
  // OpenAI Models
  {
    id: "gpt-4-turbo-preview",
    name: "GPT-4 Turbo",
    provider: "openai",
    contextWindow: 128000,
  },
  {
    id: "gpt-4",
    name: "GPT-4",
    provider: "openai",
    contextWindow: 8192,
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "openai",
    contextWindow: 16385,
  },
  // Anthropic Models
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    contextWindow: 200000,
  },
  {
    id: "claude-3-opus-20240229",
    name: "Claude 3 Opus",
    provider: "anthropic",
    contextWindow: 200000,
  },
  {
    id: "claude-3-sonnet-20240229",
    name: "Claude 3 Sonnet",
    provider: "anthropic",
    contextWindow: 200000,
  },
  {
    id: "claude-3-haiku-20240307",
    name: "Claude 3 Haiku",
    provider: "anthropic",
    contextWindow: 200000,
  },
]
