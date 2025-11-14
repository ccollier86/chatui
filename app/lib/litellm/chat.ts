/**
 * Chat Module
 *
 * Handles chat completions using Vercel AI SDK with LiteLLM as provider
 * Supports both streaming and non-streaming responses
 */

import { createOpenAI } from '@ai-sdk/openai'
import { generateText, streamText } from 'ai'
import type { ChatOptions, ChatResponse, LiteLLMConfig } from './types'

export class ChatService {
  private provider: ReturnType<typeof createOpenAI>
  private userKey: string | null = null

  constructor(config: LiteLLMConfig, userKey?: string) {
    // Create OpenAI provider pointing to LiteLLM
    this.provider = createOpenAI({
      baseURL: `${config.baseURL}/v1`,
      apiKey: config.masterKey, // Master key for initialization
    })

    this.userKey = userKey || null
  }

  /**
   * Set user's virtual key for requests
   */
  setUserKey(key: string): void {
    this.userKey = key
  }

  /**
   * Generate chat completion (non-streaming)
   *
   * @example
   * ```typescript
   * const response = await chat({
   *   messages: [
   *     { role: 'system', content: 'You are helpful' },
   *     { role: 'user', content: 'Hello!' }
   *   ],
   *   tags: ['quality'],
   *   temperature: 0.7
   * })
   *
   * console.log(response.content)
   * console.log(response.usage)
   * ```
   */
  async chat(options: ChatOptions): Promise<ChatResponse> {
    const { messages, model, tags, ...params } = options

    // Determine which model to use
    const modelId = model || 'gpt-3.5-turbo' // Default fallback

    // Build headers
    const headers: Record<string, string> = {}

    // Add user's virtual key if available
    if (this.userKey) {
      headers['Authorization'] = `Bearer ${this.userKey}`
    }

    // Add tags header if provided
    if (tags && tags.length > 0) {
      headers['x-litellm-tags'] = tags.join(',')
    }

    // Call generateText
    const result = await generateText({
      model: this.provider(modelId),
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: params.temperature,
      maxTokens: params.maxTokens,
      topP: params.topP,
      frequencyPenalty: params.frequencyPenalty,
      presencePenalty: params.presencePenalty,
      stop: params.stop,
      seed: params.seed,
      headers,
    })

    // Return clean response
    return {
      content: result.text,
      usage: {
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
      },
      finishReason: result.finishReason,
      model: modelId,
    }
  }

  /**
   * Generate chat completion (streaming)
   *
   * @example
   * ```typescript
   * const stream = await chatStream({
   *   messages: [
   *     { role: 'user', content: 'Tell me a story' }
   *   ],
   *   tags: ['budget']
   * })
   *
   * // Use with Vercel AI SDK streaming helpers
   * return stream.toTextStreamResponse()
   * ```
   */
  async chatStream(options: ChatOptions) {
    const { messages, model, tags, ...params } = options

    // Determine which model to use
    const modelId = model || 'gpt-3.5-turbo' // Default fallback

    // Build headers
    const headers: Record<string, string> = {}

    // Add user's virtual key if available
    if (this.userKey) {
      headers['Authorization'] = `Bearer ${this.userKey}`
    }

    // Add tags header if provided
    if (tags && tags.length > 0) {
      headers['x-litellm-tags'] = tags.join(',')
    }

    // Call streamText
    const result = streamText({
      model: this.provider(modelId),
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: params.temperature,
      maxTokens: params.maxTokens,
      topP: params.topP,
      frequencyPenalty: params.frequencyPenalty,
      presencePenalty: params.presencePenalty,
      stop: params.stop,
      seed: params.seed,
      headers,
    })

    return result
  }
}
