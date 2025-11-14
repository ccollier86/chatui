/**
 * LiteLLM Client
 *
 * A clean communication bridge between ChatUI and LiteLLM API.
 * Handles virtual key generation and provides complete capability information.
 *
 * @example
 * ```typescript
 * import { LiteLLMClient } from '@/lib/litellm'
 *
 * // Initialize client
 * const client = new LiteLLMClient({
 *   baseURL: process.env.LITELLM_BASE_URL!,
 *   masterKey: process.env.LITELLM_MASTER_KEY!
 * })
 *
 * // When user logs in, request a key
 * const keyInfo = await client.requestKey({
 *   user_id: 'user-123',
 *   team_id: 'team-456',
 *   duration: '24h'
 * })
 *
 * // keyInfo contains everything you need:
 * // - key: The virtual key token
 * // - models: Array of models with capabilities
 * // - features: What the user can do (chat, images, audio, etc)
 * // - budget: Budget info if exists
 * // - rateLimit: Rate limits if exists
 * // - tags: Routing tags
 * ```
 */

// Main client
export { LiteLLMClient, UserLiteLLMClient } from './client'

// Cache implementations
export { MemoryCache, NoCache } from './cache'

// Multimodal utilities
export {
  text,
  image,
  imageFromBase64,
  file,
  fileFromBase64,
  fileFromText,
  createMultimodalMessage,
  bufferToBase64,
  getMimeType,
} from './multimodal'

// Types
export type {
  LiteLLMConfig,
  CacheAdapter,
  KeyGenerateRequest,
  VirtualKeyInfo,
  ModelInfo,
  Features,
  BudgetInfo,
  RateLimitInfo,
  LiteLLMError,
  ModelMode,
  ChatMessage,
  ChatOptions,
  ChatResponse,
  ChatUsage,
  ChatRole,
  ContentPart,
  TextContentPart,
  ImageContentPart,
  FileContentPart,
} from './types'
