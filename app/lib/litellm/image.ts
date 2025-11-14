/**
 * Image Generation Module
 *
 * Handles image generation using Vercel AI SDK with LiteLLM as provider
 */

import { createOpenAI } from '@ai-sdk/openai'
import { experimental_generateImage as generateImage } from 'ai'
import type {
  ImageGenerationOptions,
  ImageGenerationResponse,
  LiteLLMConfig,
} from './types'

export class ImageService {
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
   * Generate images from text prompt
   *
   * @example
   * ```typescript
   * const response = await generateImages({
   *   prompt: 'A futuristic cityscape at sunset',
   *   model: 'dall-e-3',
   *   n: 2,
   *   size: '1024x1024'
   * })
   *
   * console.log(response.images[0].base64)
   * ```
   */
  async generateImages(
    options: ImageGenerationOptions
  ): Promise<ImageGenerationResponse> {
    const { prompt, model, tags, ...params } = options

    // Determine which model to use
    const modelId = model || 'dall-e-3' // Default fallback

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

    // Call generateImage
    const result = await generateImage({
      model: this.provider.image(modelId),
      prompt,
      n: params.n,
      size: params.size,
      aspectRatio: params.aspectRatio,
      seed: params.seed,
      headers,
    })

    // Return clean response
    return {
      image: result.image,
      images: result.images,
      model: modelId,
    }
  }
}
