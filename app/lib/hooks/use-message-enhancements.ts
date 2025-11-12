/**
 * Message Enhancements Hook
 *
 * Unified hook that uses all adapters to enhance messages with
 * reasoning, tool calls, and source citations.
 *
 * When you implement the backend features, simply swap out the
 * default adapters with your implementations.
 */

import { reasoningAdapter, ReasoningData } from "@/lib/adapters/reasoning-adapter"
import { toolAdapter, ToolCall } from "@/lib/adapters/tool-adapter"
import { sourceAdapter, SourceCitation } from "@/lib/adapters/source-adapter"

export interface MessageEnhancements {
  reasoning: ReasoningData | null
  toolCalls: ToolCall[]
  sources: SourceCitation[]
  hasReasoning: boolean
  hasToolCalls: boolean
  hasSources: boolean
  transformedContent: string
}

export function useMessageEnhancements(message: {
  role: string
  content: string
  metadata?: unknown
}): MessageEnhancements {
  // Extract reasoning
  const reasoning = reasoningAdapter.extractReasoning(message)
  const hasReasoning = reasoning !== null

  // Extract tool calls
  const toolCalls = toolAdapter.extractToolCalls(message)
  const hasToolCalls = toolCalls.length > 0

  // Extract sources
  const sources = sourceAdapter.extractSources(message)
  const hasSources = sources.length > 0

  // Transform content with sources
  const transformedContent = sourceAdapter.transformContentWithSources(
    message.content,
    sources
  )

  return {
    reasoning,
    toolCalls,
    sources,
    hasReasoning,
    hasToolCalls,
    hasSources,
    transformedContent,
  }
}

/**
 * Example usage in chat-interface.tsx:
 *
 * import { useMessageEnhancements } from "@/lib/hooks/use-message-enhancements"
 * import { Reasoning, ReasoningTrigger, ReasoningContent } from "@/components/prompt-kit/reasoning"
 * import { Tool } from "@/components/prompt-kit/tool"
 * import { Source, SourceTrigger, SourceContent } from "@/components/prompt-kit/source"
 *
 * // In your message rendering:
 * {currentChat?.messages.map((message) => {
 *   const enhancements = useMessageEnhancements(message)
 *
 *   return (
 *     <Message key={message.id}>
 *       <MessageAvatar ... />
 *       <div className="flex-1 space-y-2">
 *         {/* Reasoning (AI thinking) *\/}
 *         {enhancements.hasReasoning && (
 *           <Reasoning isStreaming={enhancements.reasoning.isStreaming}>
 *             <ReasoningTrigger />
 *             <ReasoningContent markdown>
 *               {enhancements.reasoning.content}
 *             </ReasoningContent>
 *           </Reasoning>
 *         )}
 *
 *         {/* Main content *\/}
 *         <MessageContent markdown>
 *           {enhancements.transformedContent}
 *         </MessageContent>
 *
 *         {/* Tool calls (MCP) *\/}
 *         {enhancements.hasToolCalls && (
 *           <div className="space-y-2">
 *             {enhancements.toolCalls.map((tool, idx) => (
 *               <Tool key={idx} toolPart={tool} />
 *             ))}
 *           </div>
 *         )}
 *
 *         {/* Sources (RAG) *\/}
 *         {enhancements.hasSources && (
 *           <div className="mt-2 flex flex-wrap gap-2">
 *             {enhancements.sources.map((source) => (
 *               <Source key={source.id} href={source.href}>
 *                 <SourceTrigger label={source.label} showFavicon />
 *                 <SourceContent
 *                   title={source.title}
 *                   description={source.description}
 *                 />
 *               </Source>
 *             ))}
 *           </div>
 *         )}
 *
 *         <MessageActions>...</MessageActions>
 *       </div>
 *     </Message>
 *   )
 * })}
 */
