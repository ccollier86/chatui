/**
 * HTTP Client
 *
 * Base HTTP wrapper for all LiteLLM API requests
 * Handles authentication, timeouts, and error parsing
 */

import type { HTTPRequestOptions, HTTPResponse, LiteLLMError } from './types'

export class HTTPClient {
  private baseURL: string
  private masterKey: string
  private defaultTimeout: number

  constructor(baseURL: string, masterKey: string, defaultTimeout = 30000) {
    this.baseURL = baseURL.replace(/\/$/, '') // Remove trailing slash
    this.masterKey = masterKey
    this.defaultTimeout = defaultTimeout
  }

  /**
   * Make HTTP request
   */
  async request<T = any>(
    path: string,
    options: HTTPRequestOptions = {}
  ): Promise<HTTPResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      timeout = this.defaultTimeout,
      signal,
    } = options

    const url = `${this.baseURL}${path}`

    // Setup abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.masterKey}`,
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: signal || controller.signal,
      })

      clearTimeout(timeoutId)

      // Handle non-OK responses
      if (!response.ok) {
        throw await this.parseError(response)
      }

      const data = await response.json()

      return {
        data,
        status: response.status,
        headers: response.headers,
      }
    } catch (error) {
      clearTimeout(timeoutId)

      // Re-throw if already a LiteLLMError
      if (this.isLiteLLMError(error)) {
        throw error
      }

      // Parse and throw
      throw this.createError(error)
    }
  }

  /**
   * Convenience methods
   */
  async get<T = any>(path: string, options?: HTTPRequestOptions): Promise<T> {
    const response = await this.request<T>(path, { ...options, method: 'GET' })
    return response.data
  }

  async post<T = any>(
    path: string,
    body?: any,
    options?: HTTPRequestOptions
  ): Promise<T> {
    const response = await this.request<T>(path, {
      ...options,
      method: 'POST',
      body,
    })
    return response.data
  }

  async patch<T = any>(
    path: string,
    body?: any,
    options?: HTTPRequestOptions
  ): Promise<T> {
    const response = await this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body,
    })
    return response.data
  }

  async delete<T = any>(
    path: string,
    options?: HTTPRequestOptions
  ): Promise<T> {
    const response = await this.request<T>(path, {
      ...options,
      method: 'DELETE',
    })
    return response.data
  }

  /**
   * Parse error from response
   */
  private async parseError(response: Response): Promise<LiteLLMError> {
    let message = `HTTP ${response.status}: ${response.statusText}`
    let code = `HTTP_${response.status}`
    let retryable = false
    let suggestedAction: string | undefined

    try {
      const errorBody = await response.json()
      message = errorBody.error?.message || errorBody.message || message
      code = errorBody.error?.code || errorBody.code || code
    } catch {
      // Failed to parse error body, use default message
    }

    // Determine if retryable and suggest action
    switch (response.status) {
      case 401:
        retryable = false
        suggestedAction = 'Check your LiteLLM master key is valid'
        break
      case 403:
        retryable = false
        suggestedAction = 'You do not have permission to perform this action'
        break
      case 404:
        retryable = false
        suggestedAction = 'The requested resource was not found'
        break
      case 429:
        retryable = true
        suggestedAction = 'Rate limit exceeded. Wait a moment and try again'
        break
      case 500:
      case 502:
      case 503:
      case 504:
        retryable = true
        suggestedAction = 'LiteLLM server error. Try again in a moment'
        break
      default:
        retryable = response.status >= 500
        suggestedAction = 'An error occurred. Please try again'
    }

    return {
      message,
      code,
      status: response.status,
      retryable,
      suggestedAction,
    }
  }

  /**
   * Create error from caught exception
   */
  private createError(error: unknown): LiteLLMError {
    if (error instanceof Error) {
      // Check for specific error types
      if (error.name === 'AbortError') {
        return {
          message: 'Request timeout',
          code: 'TIMEOUT',
          retryable: true,
          suggestedAction: 'The request took too long. Try again',
          originalError: error,
        }
      }

      if (
        error.message.includes('fetch') ||
        error.message.includes('network')
      ) {
        return {
          message: 'Network error',
          code: 'NETWORK_ERROR',
          retryable: true,
          suggestedAction: 'Check your internet connection and try again',
          originalError: error,
        }
      }

      return {
        message: error.message,
        code: 'UNKNOWN_ERROR',
        retryable: false,
        suggestedAction: 'An unexpected error occurred',
        originalError: error,
      }
    }

    return {
      message: String(error),
      code: 'UNKNOWN_ERROR',
      retryable: false,
      suggestedAction: 'An unexpected error occurred',
      originalError: error,
    }
  }

  /**
   * Type guard for LiteLLMError
   */
  private isLiteLLMError(error: unknown): error is LiteLLMError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      'retryable' in error
    )
  }
}
