/**
 * Reasoning Adapter
 *
 * Dependency inversion for AI reasoning/thinking display.
 * Implement this interface when you add backend support for streaming thinking.
 */

export interface ReasoningData {
  content: string
  isStreaming: boolean
}

export interface ReasoningAdapter {
  /**
   * Extract reasoning data from a message
   * @param message - The assistant message
   * @returns Reasoning data if available, null otherwise
   */
  extractReasoning(message: { role: string; content: string }): ReasoningData | null

  /**
   * Check if a message contains reasoning
   * @param message - The message to check
   * @returns True if the message has reasoning content
   */
  hasReasoning(message: { role: string; content: string }): boolean
}

/**
 * Default implementation (no-op)
 * Replace this with your actual implementation when backend is ready
 */
export class DefaultReasoningAdapter implements ReasoningAdapter {
  extractReasoning(): ReasoningData | null {
    return null
  }

  hasReasoning(): boolean {
    return false
  }
}

/**
 * Example implementation for reference
 *
 * When your backend supports thinking blocks, implement like this:
 *
 * export class AnthropicReasoningAdapter implements ReasoningAdapter {
 *   extractReasoning(message) {
 *     if (message.role !== "assistant") return null
 *
 *     // Extract thinking content from message metadata or special tags
 *     const thinkingMatch = message.content.match(/<thinking>(.*?)<\/thinking>/s)
 *     if (!thinkingMatch) return null
 *
 *     return {
 *       content: thinkingMatch[1],
 *       isStreaming: message.isStreaming ?? false
 *     }
 *   }
 *
 *   hasReasoning(message) {
 *     return this.extractReasoning(message) !== null
 *   }
 * }
 */

// Singleton instance - swap this out when you implement the adapter
export const reasoningAdapter: ReasoningAdapter = new DefaultReasoningAdapter()
