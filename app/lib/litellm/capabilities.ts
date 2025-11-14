/**
 * Capabilities Aggregator
 *
 * Aggregates features from model info to determine what the user can do
 */

import type {
  ModelInfo,
  Features,
  LiteLLMModelInfo,
  ModelMode,
} from './types'

/**
 * Parse LiteLLM model info into our clean format
 */
export function parseModelInfo(litellmModel: LiteLLMModelInfo): ModelInfo {
  const modelInfo = litellmModel.model_info || {}
  const modelName = litellmModel.model_name
  const mode = (modelInfo.mode || 'chat') as ModelMode

  // Extract provider from litellm_params.model or model_info
  const provider =
    modelInfo.litellm_provider ||
    extractProviderFromModelId(litellmModel.litellm_params?.model || modelName)

  return {
    id: modelName,
    name: generateFriendlyName(modelName),
    provider,
    mode,
    maxTokens: modelInfo.max_tokens,
    maxInputTokens: modelInfo.max_input_tokens,
    maxOutputTokens: modelInfo.max_output_tokens,
    inputCost: modelInfo.input_cost_per_token,
    outputCost: modelInfo.output_cost_per_token,
    supportsFunctionCalling: modelInfo.supports_function_calling,
    supportsVision: modelInfo.supports_vision,
    supportsSystemMessages: modelInfo.supports_system_messages,
  }
}

/**
 * Aggregate features from array of models
 */
export function aggregateFeatures(models: ModelInfo[]): Features {
  const features: Features = {
    chat: false,
    completion: false,
    embeddings: false,
    imageGeneration: false,
    audioTranscription: false,
    audioGeneration: false,
    moderation: false,
    reranking: false,
    realtime: false,
    ocr: false,
    batch: false,
    vision: false,
    functionCalling: false,
  }

  for (const model of models) {
    // Map modes to features
    switch (model.mode) {
      case 'chat':
        features.chat = true
        break
      case 'completion':
        features.completion = true
        break
      case 'embedding':
        features.embeddings = true
        break
      case 'image_generation':
        features.imageGeneration = true
        break
      case 'audio_transcription':
        features.audioTranscription = true
        break
      case 'audio_speech':
        features.audioGeneration = true
        break
      case 'moderation':
        features.moderation = true
        break
      case 'rerank':
        features.reranking = true
        break
      case 'realtime':
        features.realtime = true
        break
      case 'ocr':
        features.ocr = true
        break
      case 'batch':
        features.batch = true
        break
    }

    // Additional capabilities
    if (model.supportsVision) {
      features.vision = true
    }

    if (model.supportsFunctionCalling) {
      features.functionCalling = true
    }
  }

  return features
}

/**
 * Extract provider from model ID
 */
function extractProviderFromModelId(modelId: string): string {
  // Handle format: "provider/model-name" or "provider:model-name"
  const match = modelId.match(/^([^/:]+)[/:]/)
  if (match) {
    return match[1]
  }

  // Try to infer from model name patterns
  if (modelId.includes('gpt') || modelId.includes('openai')) return 'openai'
  if (modelId.includes('claude') || modelId.includes('anthropic'))
    return 'anthropic'
  if (modelId.includes('gemini') || modelId.includes('palm')) return 'google'
  if (modelId.includes('llama')) return 'meta'
  if (modelId.includes('mistral') || modelId.includes('mixtral'))
    return 'mistral'
  if (modelId.includes('cohere')) return 'cohere'
  if (modelId.includes('dall-e') || modelId.includes('dalle'))
    return 'openai'
  if (modelId.includes('whisper')) return 'openai'
  if (modelId.includes('stable-diffusion')) return 'stability'

  return 'unknown'
}

/**
 * Generate friendly display name from model ID
 */
function generateFriendlyName(modelId: string): string {
  // Strip provider prefix if present
  const nameWithoutProvider = modelId.replace(/^[^/:]+[/:]/, '')

  // Common model name patterns
  const patterns: Record<string, string> = {
    'gpt-4-turbo': 'GPT-4 Turbo',
    'gpt-4o': 'GPT-4o',
    'gpt-4': 'GPT-4',
    'gpt-3.5-turbo': 'GPT-3.5 Turbo',
    'claude-3-5-sonnet': 'Claude 3.5 Sonnet',
    'claude-3-opus': 'Claude 3 Opus',
    'claude-3-sonnet': 'Claude 3 Sonnet',
    'claude-3-haiku': 'Claude 3 Haiku',
    'gemini-1.5-pro': 'Gemini 1.5 Pro',
    'gemini-1.5-flash': 'Gemini 1.5 Flash',
    'gemini-pro': 'Gemini Pro',
    'llama-3': 'Llama 3',
    'llama-2-70b': 'Llama 2 70B',
    'llama-2-13b': 'Llama 2 13B',
    'mistral-large': 'Mistral Large',
    'mistral-medium': 'Mistral Medium',
    'mixtral-8x7b': 'Mixtral 8x7B',
    'dall-e-3': 'DALL-E 3',
    'dall-e-2': 'DALL-E 2',
    'whisper-1': 'Whisper',
    'text-embedding-ada-002': 'Text Embedding Ada 002',
    'text-embedding-3-small': 'Text Embedding 3 Small',
    'text-embedding-3-large': 'Text Embedding 3 Large',
  }

  // Check for exact matches
  for (const [pattern, name] of Object.entries(patterns)) {
    if (nameWithoutProvider.includes(pattern)) {
      return name
    }
  }

  // Fallback: Capitalize and clean up
  return nameWithoutProvider
    .split(/[-_/]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
