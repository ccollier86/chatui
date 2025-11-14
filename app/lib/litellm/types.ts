/**
 * LiteLLM Client TypeScript Types
 *
 * Comprehensive type definitions for LiteLLM API interactions
 */

// ============================================================================
// Configuration Types
// ============================================================================

export interface LiteLLMConfig {
  baseURL: string
  masterKey: string
  cache?: CacheAdapter
  defaultTimeout?: number
}

export interface CacheAdapter {
  get(key: string): Promise<any | null>
  set(key: string, value: any, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
}

// ============================================================================
// Virtual Key Types - Request
// ============================================================================

export interface KeyGenerateRequest {
  user_id?: string
  team_id?: string
  duration?: string
  models?: string[]
  aliases?: Record<string, string>
  config?: Record<string, any>
  spend?: number
  max_budget?: number
  budget_duration?: string
  user_email?: string
  max_parallel_requests?: number
  metadata?: Record<string, any>
  tpm_limit?: number
  rpm_limit?: number
  model_max_budget?: Record<string, number>
  model_rpm_limit?: number
  model_tpm_limit?: number
  key_alias?: string
  permissions?: Record<string, any>
  guardrails?: any[]
  blocked?: boolean
  tags?: string[]
  enforced_params?: Record<string, any>
  allowed_routes?: string[]
}

// ============================================================================
// Virtual Key Types - Response (from LiteLLM)
// ============================================================================

export interface LiteLLMKeyResponse {
  key: string
  token?: string
  models: string[]
  tags?: string[]

  // Budget & Spend
  spend?: number
  max_budget?: number
  budget_duration?: string

  // Rate Limits
  tpm_limit?: number
  rpm_limit?: number
  max_parallel_requests?: number

  // Model-specific limits
  model_max_budget?: Record<string, number>
  model_tpm_limit?: number
  model_rpm_limit?: number

  // Metadata
  user_id?: string
  team_id?: string
  key_alias?: string
  duration?: string
  expires?: string
  metadata?: Record<string, any>

  // Configuration
  aliases?: Record<string, string>
  config?: Record<string, any>
  permissions?: Record<string, any>
  guardrails?: any[]
  blocked?: boolean
  allowed_routes?: string[]
  enforced_params?: Record<string, any>

  // System fields
  token_id?: string
  created_at?: string
  created_by?: string
  updated_by?: string
}

// ============================================================================
// Model Info Types
// ============================================================================

export type ModelMode =
  | 'chat'
  | 'completion'
  | 'embedding'
  | 'image_generation'
  | 'audio_transcription'
  | 'audio_speech'
  | 'moderation'
  | 'rerank'
  | 'batch'
  | 'realtime'
  | 'ocr'

export interface LiteLLMModelInfo {
  model_name: string
  litellm_params: {
    model: string
    [key: string]: any
  }
  model_info: {
    id?: string
    key?: string
    mode?: ModelMode
    max_tokens?: number
    max_input_tokens?: number
    max_output_tokens?: number
    input_cost_per_token?: number
    output_cost_per_token?: number
    input_cost_per_character?: number
    output_cost_per_character?: number
    litellm_provider?: string
    supports_function_calling?: boolean
    supports_vision?: boolean
    supports_system_messages?: boolean
    [key: string]: any
  }
}

// ============================================================================
// Parsed/Cleaned Types (What we return to the app)
// ============================================================================

export interface ModelInfo {
  id: string
  name: string
  provider: string
  mode: ModelMode
  maxTokens?: number
  maxInputTokens?: number
  maxOutputTokens?: number
  inputCost?: number
  outputCost?: number
  supportsFunctionCalling?: boolean
  supportsVision?: boolean
  supportsSystemMessages?: boolean
}

export interface Features {
  chat: boolean
  completion: boolean
  embeddings: boolean
  imageGeneration: boolean
  audioTranscription: boolean
  audioGeneration: boolean
  moderation: boolean
  reranking: boolean
  realtime: boolean
  ocr: boolean
  batch: boolean
  vision: boolean
  functionCalling: boolean
}

export interface BudgetInfo {
  max: number
  spent: number
  remaining: number
  duration?: string
}

export interface RateLimitInfo {
  tpm?: number
  rpm?: number
  maxParallel?: number
}

export interface VirtualKeyInfo {
  key: string
  models: ModelInfo[]
  features: Features
  budget?: BudgetInfo
  rateLimit?: RateLimitInfo
  tags: string[]
  expiresAt?: Date
  userId?: string
  teamId?: string
  metadata?: Record<string, any>
  aliases?: Record<string, string>
}

// ============================================================================
// Error Types
// ============================================================================

export interface LiteLLMError {
  message: string
  code?: string
  status?: number
  retryable: boolean
  suggestedAction?: string
  originalError?: any
}

// ============================================================================
// HTTP Types
// ============================================================================

export interface HTTPRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  timeout?: number
  signal?: AbortSignal
}

export interface HTTPResponse<T = any> {
  data: T
  status: number
  headers: Headers
}
