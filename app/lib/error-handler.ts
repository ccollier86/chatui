/**
 * Error handling utilities for API requests with context-specific messages
 */

export interface APIError {
  message: string
  code?: string
  retryable: boolean
  suggestedAction?: string
}

export function parseAPIError(error: unknown): APIError {
  // Default error
  const defaultError: APIError = {
    message: "An unexpected error occurred",
    retryable: true,
    suggestedAction: "Please try again",
  }

  // Not an error object
  if (!(error instanceof Error)) {
    return defaultError
  }

  const errorMessage = error.message.toLowerCase()

  // Network errors
  if (errorMessage.includes("fetch") || errorMessage.includes("network")) {
    return {
      message: "Network connection error",
      code: "NETWORK_ERROR",
      retryable: true,
      suggestedAction: "Check your internet connection and try again",
    }
  }

  // API Key errors
  if (
    errorMessage.includes("api key") ||
    errorMessage.includes("unauthorized") ||
    errorMessage.includes("401")
  ) {
    return {
      message: "Invalid or missing API key",
      code: "AUTH_ERROR",
      retryable: false,
      suggestedAction: "Please check your API keys in Settings",
    }
  }

  // Rate limit errors
  if (
    errorMessage.includes("rate limit") ||
    errorMessage.includes("429") ||
    errorMessage.includes("too many requests")
  ) {
    return {
      message: "Rate limit exceeded",
      code: "RATE_LIMIT",
      retryable: true,
      suggestedAction: "Please wait a moment before trying again",
    }
  }

  // Model errors
  if (
    errorMessage.includes("model") ||
    errorMessage.includes("404") ||
    errorMessage.includes("not found")
  ) {
    return {
      message: "Model not found or unavailable",
      code: "MODEL_ERROR",
      retryable: false,
      suggestedAction: "Try selecting a different model in the chat header",
    }
  }

  // Timeout errors
  if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
    return {
      message: "Request timed out",
      code: "TIMEOUT",
      retryable: true,
      suggestedAction: "The request took too long. Try again or simplify your message",
    }
  }

  // Server errors
  if (errorMessage.includes("500") || errorMessage.includes("server error")) {
    return {
      message: "Server error",
      code: "SERVER_ERROR",
      retryable: true,
      suggestedAction: "The server encountered an error. Please try again",
    }
  }

  // Context length errors
  if (
    errorMessage.includes("context") ||
    errorMessage.includes("token") ||
    errorMessage.includes("too long")
  ) {
    return {
      message: "Message too long",
      code: "CONTEXT_LENGTH",
      retryable: false,
      suggestedAction: "Your conversation is too long. Try starting a new chat",
    }
  }

  // Return error message with default values
  return {
    message: error.message || defaultError.message,
    retryable: true,
    suggestedAction: "Please try again",
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    initialDelay?: number
    maxDelay?: number
    onRetry?: (attempt: number, error: unknown) => void
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    onRetry,
  } = options

  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Don't retry if this is the last attempt
      if (attempt === maxRetries) {
        break
      }

      // Check if error is retryable
      const apiError = parseAPIError(error)
      if (!apiError.retryable) {
        break
      }

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, error)
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay)

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}
