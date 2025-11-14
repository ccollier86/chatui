/**
 * Virtual Keys Manager
 *
 * Handles virtual key generation and parsing
 */

import type {
  KeyGenerateRequest,
  LiteLLMKeyResponse,
  VirtualKeyInfo,
  BudgetInfo,
  RateLimitInfo,
  LiteLLMModelInfo,
  CacheAdapter,
} from './types'
import type { HTTPClient } from './http-client'
import { parseModelInfo, aggregateFeatures } from './capabilities'

export class KeysManager {
  constructor(
    private http: HTTPClient,
    private cache: CacheAdapter
  ) {}

  /**
   * Request a virtual key and return complete parsed information
   *
   * This is the main method - it generates a key and fetches all model info
   * to return a complete object ready for the app to use.
   */
  async requestKey(params: KeyGenerateRequest): Promise<VirtualKeyInfo> {
    // Step 1: Generate the virtual key
    const keyResponse = await this.http.post<LiteLLMKeyResponse>(
      '/key/generate',
      params
    )

    // Step 2: Get model info for each model (with caching)
    const models = await this.getModelsInfo(keyResponse.models)

    // Step 3: Aggregate features
    const features = aggregateFeatures(models)

    // Step 4: Parse budget info
    const budget = this.parseBudget(keyResponse)

    // Step 5: Parse rate limit info
    const rateLimit = this.parseRateLimit(keyResponse)

    // Step 6: Parse expiry
    const expiresAt = keyResponse.expires
      ? new Date(keyResponse.expires)
      : undefined

    // Step 7: Return complete object
    return {
      key: keyResponse.key || keyResponse.token || '',
      models,
      features,
      budget,
      rateLimit,
      tags: keyResponse.tags || [],
      expiresAt,
      userId: keyResponse.user_id,
      teamId: keyResponse.team_id,
      metadata: keyResponse.metadata,
      aliases: keyResponse.aliases,
    }
  }

  /**
   * Get model info for multiple models (with caching)
   */
  private async getModelsInfo(modelIds: string[]) {
    const models = await Promise.all(
      modelIds.map((modelId) => this.getModelInfo(modelId))
    )

    // Filter out any null results (failed fetches)
    return models.filter((m) => m !== null)
  }

  /**
   * Get info for a single model (cached)
   */
  private async getModelInfo(modelId: string) {
    const cacheKey = `model_info:${modelId}`

    // Check cache first
    const cached = await this.cache.get(cacheKey)
    if (cached) {
      return parseModelInfo(cached)
    }

    try {
      // Fetch from API
      const modelInfo = await this.http.get<LiteLLMModelInfo>(
        `/model/info?model=${encodeURIComponent(modelId)}`
      )

      // Cache it (24 hour TTL)
      await this.cache.set(cacheKey, modelInfo, 24 * 60 * 60)

      return parseModelInfo(modelInfo)
    } catch (error) {
      console.error(`Failed to fetch model info for ${modelId}:`, error)

      // Return a basic model info as fallback
      return {
        id: modelId,
        name: modelId,
        provider: 'unknown',
        mode: 'chat' as const,
      }
    }
  }

  /**
   * Parse budget information from key response
   */
  private parseBudget(keyResponse: LiteLLMKeyResponse): BudgetInfo | undefined {
    if (keyResponse.max_budget === undefined) {
      return undefined
    }

    const max = keyResponse.max_budget
    const spent = keyResponse.spend || 0
    const remaining = Math.max(0, max - spent)

    return {
      max,
      spent,
      remaining,
      duration: keyResponse.budget_duration,
    }
  }

  /**
   * Parse rate limit information from key response
   */
  private parseRateLimit(
    keyResponse: LiteLLMKeyResponse
  ): RateLimitInfo | undefined {
    const hasRateLimit =
      keyResponse.tpm_limit !== undefined ||
      keyResponse.rpm_limit !== undefined ||
      keyResponse.max_parallel_requests !== undefined

    if (!hasRateLimit) {
      return undefined
    }

    return {
      tpm: keyResponse.tpm_limit,
      rpm: keyResponse.rpm_limit,
      maxParallel: keyResponse.max_parallel_requests,
    }
  }
}
