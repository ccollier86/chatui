/**
 * LiteLLM Client
 *
 * Main orchestrator class that provides a simple API for interacting with LiteLLM
 */

import type { LiteLLMConfig, KeyGenerateRequest, VirtualKeyInfo } from './types'
import { HTTPClient } from './http-client'
import { MemoryCache } from './cache'
import { KeysManager } from './keys'

export class LiteLLMClient {
  private http: HTTPClient
  private keysManager: KeysManager

  constructor(config: LiteLLMConfig) {
    // Validate config
    if (!config.baseURL) {
      throw new Error('LiteLLM baseURL is required')
    }

    if (!config.masterKey) {
      throw new Error('LiteLLM masterKey is required')
    }

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
   * Get the base URL
   */
  getBaseURL(): string {
    return this.http['baseURL']
  }
}
