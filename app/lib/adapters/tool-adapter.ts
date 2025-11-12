/**
 * Tool Adapter
 *
 * Dependency inversion for MCP tool call visualization.
 * Implement this interface when you add MCP server support.
 */

export interface ToolCall {
  type: string
  state: "pending" | "running" | "completed" | "error"
  input?: Record<string, unknown>
  output?: Record<string, unknown>
  toolCallId?: string
  errorText?: string
}

export interface ToolAdapter {
  /**
   * Extract tool calls from a message
   * @param message - The assistant message
   * @returns Array of tool calls if available, empty array otherwise
   */
  extractToolCalls(message: { role: string; content: string; metadata?: unknown }): ToolCall[]

  /**
   * Check if a message contains tool calls
   * @param message - The message to check
   * @returns True if the message has tool calls
   */
  hasToolCalls(message: { role: string; content: string; metadata?: unknown }): boolean
}

/**
 * Default implementation (no-op)
 * Replace this with your actual implementation when MCP is integrated
 */
export class DefaultToolAdapter implements ToolAdapter {
  extractToolCalls(): ToolCall[] {
    return []
  }

  hasToolCalls(): boolean {
    return false
  }
}

/**
 * Example implementation for reference
 *
 * When you integrate MCP servers, implement like this:
 *
 * export class MCPToolAdapter implements ToolAdapter {
 *   extractToolCalls(message) {
 *     if (message.role !== "assistant") return []
 *     if (!message.metadata?.toolCalls) return []
 *
 *     // Extract tool calls from AI SDK response
 *     return message.metadata.toolCalls.map(tc => ({
 *       type: tc.toolName,
 *       state: tc.state || "completed",
 *       input: tc.args,
 *       output: tc.result,
 *       toolCallId: tc.toolCallId,
 *       errorText: tc.error
 *     }))
 *   }
 *
 *   hasToolCalls(message) {
 *     return this.extractToolCalls(message).length > 0
 *   }
 * }
 *
 * // Then in your chat-interface.tsx:
 * import { toolAdapter } from "@/lib/adapters/tool-adapter"
 * import { Tool } from "@/components/prompt-kit/tool"
 *
 * // In message rendering:
 * {toolAdapter.hasToolCalls(message) && (
 *   <div className="space-y-2">
 *     {toolAdapter.extractToolCalls(message).map((tool, idx) => (
 *       <Tool key={idx} toolPart={tool} />
 *     ))}
 *   </div>
 * )}
 */

// Singleton instance - swap this out when you implement the adapter
export const toolAdapter: ToolAdapter = new DefaultToolAdapter()
