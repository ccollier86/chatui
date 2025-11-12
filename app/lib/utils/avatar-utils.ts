/**
 * Avatar Utilities
 *
 * Provides avatar URLs and fallbacks for users and AI providers.
 */

import { Provider } from "@/types"

/**
 * Get avatar URL for an AI provider
 * Uses simple-icons CDN for provider logos
 */
export function getProviderAvatar(provider: Provider, model?: string): string | undefined {
  // For LiteLLM, try to detect the actual provider from the model ID
  if (provider === "litellm" && model) {
    if (model.includes("gpt") || model.includes("openai")) {
      return "https://cdn.simpleicons.org/openai/412991"
    }
    if (model.includes("claude") || model.includes("anthropic")) {
      return "https://cdn.simpleicons.org/anthropic/D4A27F"
    }
    if (model.includes("gemini") || model.includes("google")) {
      return "https://cdn.simpleicons.org/google/4285F4"
    }
    if (model.includes("llama") || model.includes("meta")) {
      return "https://cdn.simpleicons.org/meta/0668E1"
    }
    if (model.includes("mistral")) {
      return "https://cdn.simpleicons.org/mistral/F7D046"
    }
    if (model.includes("cohere")) {
      return "https://cdn.simpleicons.org/cohere/39594C"
    }
  }

  // Direct provider icons
  switch (provider) {
    case "openai":
      return "https://cdn.simpleicons.org/openai/412991"
    case "anthropic":
      return "https://cdn.simpleicons.org/anthropic/D4A27F"
    case "litellm":
      // Generic AI icon for unknown LiteLLM providers
      return undefined // Will use fallback
    default:
      return undefined
  }
}

/**
 * Get fallback text for provider avatar
 */
export function getProviderFallback(provider: Provider, model?: string): string {
  // For LiteLLM, try to detect from model
  if (provider === "litellm" && model) {
    if (model.includes("gpt")) return "GPT"
    if (model.includes("claude")) return "AI"
    if (model.includes("gemini")) return "G"
    if (model.includes("llama")) return "L"
    if (model.includes("mistral")) return "M"
  }

  switch (provider) {
    case "openai":
      return "GPT"
    case "anthropic":
      return "AI"
    case "litellm":
      return "AI"
    default:
      return "AI"
  }
}

/**
 * User avatar styles
 */
export type UserAvatarStyle = "initials" | "image" | "gradient"

export interface UserAvatarConfig {
  style: UserAvatarStyle
  value: string // Initials, image URL, or gradient name
}

/**
 * Get user avatar based on configuration
 */
export function getUserAvatar(config: UserAvatarConfig): {
  src?: string
  fallback: string
  className?: string
} {
  switch (config.style) {
    case "image":
      return {
        src: config.value,
        fallback: "U",
      }

    case "initials":
      return {
        fallback: config.value || "U",
        className: "bg-primary text-primary-foreground font-semibold",
      }

    case "gradient":
      return {
        fallback: config.value || "U",
        className: getGradientClass(config.value),
      }

    default:
      return {
        fallback: "U",
        className: "bg-primary text-primary-foreground font-semibold",
      }
  }
}

/**
 * Predefined gradient classes for user avatars
 */
function getGradientClass(gradientName: string): string {
  const gradients: Record<string, string> = {
    ocean: "bg-gradient-to-br from-blue-400 to-cyan-600 text-white font-semibold",
    sunset: "bg-gradient-to-br from-orange-400 to-pink-600 text-white font-semibold",
    forest: "bg-gradient-to-br from-green-400 to-emerald-600 text-white font-semibold",
    purple: "bg-gradient-to-br from-purple-400 to-indigo-600 text-white font-semibold",
    fire: "bg-gradient-to-br from-red-400 to-orange-600 text-white font-semibold",
    midnight: "bg-gradient-to-br from-slate-600 to-blue-900 text-white font-semibold",
  }

  return gradients[gradientName] || "bg-gradient-to-br from-gray-400 to-gray-600 text-white font-semibold"
}

/**
 * Available gradient presets for user selection
 */
export const AVATAR_GRADIENTS = [
  { name: "ocean", label: "Ocean", className: "bg-gradient-to-br from-blue-400 to-cyan-600 text-white font-semibold" },
  { name: "sunset", label: "Sunset", className: "bg-gradient-to-br from-orange-400 to-pink-600 text-white font-semibold" },
  { name: "forest", label: "Forest", className: "bg-gradient-to-br from-green-400 to-emerald-600 text-white font-semibold" },
  { name: "purple", label: "Purple", className: "bg-gradient-to-br from-purple-400 to-indigo-600 text-white font-semibold" },
  { name: "fire", label: "Fire", className: "bg-gradient-to-br from-red-400 to-orange-600 text-white font-semibold" },
  { name: "midnight", label: "Midnight", className: "bg-gradient-to-br from-slate-600 to-blue-900 text-white font-semibold" },
]
