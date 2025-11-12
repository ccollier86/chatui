/**
 * LiteLLM Adapter
 *
 * Provides dynamic model discovery and management for LiteLLM proxy.
 * LiteLLM acts as a unified gateway to 100+ LLM providers with a single OpenAI-compatible API.
 *
 * Key Features:
 * - Dynamic model discovery from LiteLLM /v1/models endpoint
 * - Single adapter for all providers (OpenAI, Anthropic, Google, Meta, etc.)
 * - Automatic model list caching with configurable refresh interval
 * - Graceful fallback when LiteLLM is not configured
 *
 * Configuration:
 * - LITELLM_BASE_URL: LiteLLM proxy URL (default: http://localhost:4000)
 * - LITELLM_API_KEY: API key for LiteLLM proxy (optional if proxy doesn't require auth)
 * - LITELLM_ENABLED: Set to "true" to enable LiteLLM integration
 */

import { Model } from "@/types"

interface LiteLLMModel {
  id: string
  object: string
  created?: number
  owned_by?: string
}

interface LiteLLMModelsResponse {
  object: string
  data: LiteLLMModel[]
}

export interface LiteLLMConfig {
  baseURL: string
  apiKey?: string
  enabled: boolean
}

export interface LiteLLMAdapter {
  /**
   * Fetch available models from LiteLLM proxy
   * @returns Promise resolving to array of Model objects
   */
  fetchModels(): Promise<Model[]>

  /**
   * Check if LiteLLM is properly configured
   * @returns True if LiteLLM is enabled and configured
   */
  isConfigured(): boolean

  /**
   * Get LiteLLM configuration
   * @returns Current LiteLLM configuration
   */
  getConfig(): LiteLLMConfig

  /**
   * Clear cached models (forces refresh on next fetchModels call)
   */
  clearCache(): void
}

class LiteLLMAdapterImpl implements LiteLLMAdapter {
  private config: LiteLLMConfig
  private cachedModels: Model[] | null = null
  private cacheTimestamp: number = 0
  private readonly CACHE_DURATION_MS = 5 * 60 * 1000 // 5 minutes

  constructor() {
    this.config = this.loadConfig()
  }

  private loadConfig(): LiteLLMConfig {
    return {
      baseURL: process.env.LITELLM_BASE_URL || "http://localhost:4000",
      apiKey: process.env.LITELLM_API_KEY,
      enabled: process.env.LITELLM_ENABLED === "true",
    }
  }

  isConfigured(): boolean {
    return this.config.enabled && !!this.config.baseURL
  }

  getConfig(): LiteLLMConfig {
    return { ...this.config }
  }

  clearCache(): void {
    this.cachedModels = null
    this.cacheTimestamp = 0
  }

  async fetchModels(): Promise<Model[]> {
    if (!this.isConfigured()) {
      console.warn("LiteLLM is not configured. Set LITELLM_ENABLED=true to enable.")
      return []
    }

    // Return cached models if still valid
    const now = Date.now()
    if (this.cachedModels && now - this.cacheTimestamp < this.CACHE_DURATION_MS) {
      console.log("Returning cached LiteLLM models")
      return this.cachedModels
    }

    try {
      const url = `${this.config.baseURL}/v1/models`
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      if (this.config.apiKey) {
        headers["Authorization"] = `Bearer ${this.config.apiKey}`
      }

      console.log(`Fetching models from LiteLLM: ${url}`)

      const response = await fetch(url, {
        method: "GET",
        headers,
        // Set timeout to prevent hanging
        signal: AbortSignal.timeout(10000), // 10 seconds
      })

      if (!response.ok) {
        throw new Error(
          `LiteLLM API error: ${response.status} ${response.statusText}`
        )
      }

      const data: LiteLLMModelsResponse = await response.json()

      if (!data.data || !Array.isArray(data.data)) {
        throw new Error("Invalid response from LiteLLM /v1/models endpoint")
      }

      // Transform LiteLLM models to our Model type
      const models = data.data.map((model) => this.transformModel(model))

      // Cache the results
      this.cachedModels = models
      this.cacheTimestamp = now

      console.log(`Successfully fetched ${models.length} models from LiteLLM`)
      return models
    } catch (error) {
      console.error("Failed to fetch models from LiteLLM:", error)

      // Return cached models if available, even if expired
      if (this.cachedModels) {
        console.warn("Using stale cached models due to fetch error")
        return this.cachedModels
      }

      // Return empty array on error
      return []
    }
  }

  private transformModel(litellmModel: LiteLLMModel): Model {
    const modelId = litellmModel.id
    const ownedBy = litellmModel.owned_by || "unknown"

    // Generate human-readable name from model ID
    const name = this.generateModelName(modelId, ownedBy)

    // Estimate context window based on model ID patterns
    const contextWindow = this.estimateContextWindow(modelId)

    return {
      id: modelId,
      name,
      provider: "litellm", // All LiteLLM models use the same provider adapter
      contextWindow,
    }
  }

  private generateModelName(modelId: string, ownedBy: string): string {
    // Try to create a nice display name from the model ID

    // Handle common patterns
    if (modelId.includes("gpt-4-turbo")) return "GPT-4 Turbo"
    if (modelId.includes("gpt-4o")) return "GPT-4o"
    if (modelId === "gpt-4") return "GPT-4"
    if (modelId.includes("gpt-3.5-turbo")) return "GPT-3.5 Turbo"
    if (modelId.includes("claude-3-5-sonnet")) return "Claude 3.5 Sonnet"
    if (modelId.includes("claude-3-opus")) return "Claude 3 Opus"
    if (modelId.includes("claude-3-sonnet")) return "Claude 3 Sonnet"
    if (modelId.includes("claude-3-haiku")) return "Claude 3 Haiku"
    if (modelId.includes("gemini-pro")) return "Gemini Pro"
    if (modelId.includes("gemini-1.5-pro")) return "Gemini 1.5 Pro"
    if (modelId.includes("gemini-1.5-flash")) return "Gemini 1.5 Flash"
    if (modelId.includes("llama-2-70b")) return "Llama 2 70B"
    if (modelId.includes("llama-2-13b")) return "Llama 2 13B"
    if (modelId.includes("llama-2-7b")) return "Llama 2 7B"
    if (modelId.includes("llama-3")) return "Llama 3"
    if (modelId.includes("mistral")) return "Mistral"
    if (modelId.includes("mixtral")) return "Mixtral"

    // Fallback: Capitalize and clean up the model ID
    return modelId
      .split(/[-_/]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  private estimateContextWindow(modelId: string): number {
    // Estimate context window based on known model patterns
    // These are approximations; actual values may vary

    // GPT-4 variants
    if (modelId.includes("gpt-4-turbo") || modelId.includes("gpt-4o")) {
      return 128000
    }
    if (modelId === "gpt-4") return 8192
    if (modelId.includes("gpt-3.5-turbo-16k")) return 16385
    if (modelId.includes("gpt-3.5-turbo")) return 4096

    // Claude variants
    if (modelId.includes("claude-3")) return 200000
    if (modelId.includes("claude-2")) return 100000

    // Gemini variants
    if (modelId.includes("gemini-1.5-pro")) return 1000000
    if (modelId.includes("gemini-pro")) return 32000

    // Llama variants
    if (modelId.includes("llama")) return 4096

    // Mistral variants
    if (modelId.includes("mistral") || modelId.includes("mixtral")) return 32000

    // Default fallback
    return 4096
  }
}

// Singleton instance
export const litellmAdapter: LiteLLMAdapter = new LiteLLMAdapterImpl()

/**
 * Usage Example:
 *
 * // In your API route or component:
 * import { litellmAdapter } from "@/lib/adapters/litellm-adapter"
 *
 * // Check if LiteLLM is configured
 * if (litellmAdapter.isConfigured()) {
 *   const models = await litellmAdapter.fetchModels()
 *   console.log("Available LiteLLM models:", models)
 * }
 *
 * // Get configuration
 * const config = litellmAdapter.getConfig()
 * console.log("LiteLLM baseURL:", config.baseURL)
 *
 * // Clear cache (force refresh)
 * litellmAdapter.clearCache()
 */
