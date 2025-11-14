/**
 * LiteLLM Client
 *
 * Main orchestrator class that provides a simple API for interacting with LiteLLM
 */

import type {
  LiteLLMConfig,
  KeyGenerateRequest,
  VirtualKeyInfo,
  ChatOptions,
  ChatResponse,
} from './types'
import { HTTPClient } from './http-client'
import { MemoryCache } from './cache'
import { KeysManager } from './keys'
import { ChatService } from './chat'

export class LiteLLMClient {
  private config: LiteLLMConfig
  private http: HTTPClient
  private keysManager: KeysManager
  private chatService: ChatService

  constructor(config: LiteLLMConfig) {
    // Validate config
    if (!config.baseURL) {
      throw new Error('LiteLLM baseURL is required')
    }

    if (!config.masterKey) {
      throw new Error('LiteLLM masterKey is required')
    }

    this.config = config

    // Initialize HTTP client
    this.http = new HTTPClient(
      config.baseURL,
      config.masterKey,
      config.defaultTimeout
    )

    // Initialize cache (use provided or default to memory cache)
    const cache = config.cache || new MemoryCache()

    // Initialize managers
    this.keysManager = new KeysManager(this.http, cache)
    this.chatService = new ChatService(config)
  }

  /**
   * Request a virtual key for a user
   *
   * This is the main method you'll use when a user logs in.
   * It generates a virtual key and returns complete information about
   * what the user can do, ready to configure the UI.
   *
   * @param params - Key generation parameters
   * @returns Complete virtual key info with models, features, budget, etc.
   *
   * @example
   * ```typescript
   * const keyInfo = await client.requestKey({
   *   user_id: 'user-123',
   *   team_id: 'team-456',
   *   duration: '24h'
   * })
   *
   * // Use the info to configure UI
   * if (keyInfo.features.imageGeneration) {
   *   // Show image generation UI
   * }
   *
   * // Store the key for requests
   * session.set('litellm_key', keyInfo.key)
   * ```
   */
  async requestKey(params: KeyGenerateRequest): Promise<VirtualKeyInfo> {
    return this.keysManager.requestKey(params)
  }

  /**
   * Create a user-specific client with their virtual key
   *
   * @param key - User's virtual key
   * @returns New client instance configured for the user
   *
   * @example
   * ```typescript
   * const keyInfo = await client.requestKey({ user_id: '123' })
   * const userClient = client.withKey(keyInfo.key)
   *
   * // Now all requests use the user's key
   * await userClient.chat({ messages: [...] })
   * ```
   */
  withKey(key: string): UserLiteLLMClient {
    return new UserLiteLLMClient(this.config, key)
  }

  /**
   * Get the base URL
   */
  getBaseURL(): string {
    return this.http['baseURL']
  }
}

/**
 * User-specific client with virtual key set
 * All requests automatically use the user's virtual key and permissions
 */
export class UserLiteLLMClient {
  private chatService: ChatService

  constructor(config: LiteLLMConfig, userKey: string) {
    // Initialize chat service with user's key
    this.chatService = new ChatService(config, userKey)
  }

  /**
   * Generate chat completion (non-streaming)
   *
   * @example
   * ```typescript
   * const response = await userClient.chat({
   *   messages: [
   *     { role: 'system', content: 'You are helpful' },
   *     { role: 'user', content: 'Hello!' }
   *   ],
   *   tags: ['quality'],
   *   temperature: 0.7
   * })
   *
   * console.log(response.content) // "Hello! How can I help you?"
   * console.log(response.usage.totalTokens) // 25
   * ```
   */
  async chat(options: ChatOptions): Promise<ChatResponse> {
    return this.chatService.chat(options)
  }

  /**
   * Generate chat completion (streaming)
   *
   * Returns Vercel AI SDK StreamTextResult - use with their streaming helpers
   *
   * @example
   * ```typescript
   * const stream = await userClient.chatStream({
   *   messages: [
   *     { role: 'user', content: 'Tell me a story' }
   *   ],
   *   tags: ['budget']
   * })
   *
   * // In Next.js API route:
   * return stream.toTextStreamResponse()
   *
   * // Or access the stream directly:
   * for await (const chunk of stream.textStream) {
   *   console.log(chunk)
   * }
   * ```
   */
  async chatStream(options: ChatOptions) {
    return this.chatService.chatStream(options)
  }
}
