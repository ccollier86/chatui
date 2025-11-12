/**
 * Source Adapter
 *
 * Dependency inversion for RAG source citations.
 * Implement this interface when you add RAG pipeline support.
 */

export interface SourceCitation {
  id: string
  href: string
  title: string
  description?: string
  label: string
  showFavicon?: boolean
}

export interface SourceAdapter {
  /**
   * Extract source citations from a message
   * @param message - The assistant message
   * @returns Array of source citations if available, empty array otherwise
   */
  extractSources(message: { role: string; content: string; metadata?: unknown }): SourceCitation[]

  /**
   * Check if a message contains source citations
   * @param message - The message to check
   * @returns True if the message has sources
   */
  hasSources(message: { role: string; content: string; metadata?: unknown }): boolean

  /**
   * Transform markdown content to include Source components
   * @param content - The markdown content
   * @param sources - The source citations
   * @returns Transformed content with source references
   */
  transformContentWithSources(content: string, sources: SourceCitation[]): string
}

/**
 * Default implementation (no-op)
 * Replace this with your actual implementation when RAG is integrated
 */
export class DefaultSourceAdapter implements SourceAdapter {
  extractSources(): SourceCitation[] {
    return []
  }

  hasSources(): boolean {
    return false
  }

  transformContentWithSources(content: string): string {
    return content
  }
}

/**
 * Example implementation for reference
 *
 * When you integrate RAG, implement like this:
 *
 * export class RAGSourceAdapter implements SourceAdapter {
 *   extractSources(message) {
 *     if (message.role !== "assistant") return []
 *     if (!message.metadata?.sources) return []
 *
 *     // Extract sources from RAG pipeline response
 *     return message.metadata.sources.map((source, idx) => ({
 *       id: source.id || `source-${idx}`,
 *       href: source.url,
 *       title: source.title,
 *       description: source.snippet,
 *       label: `Source ${idx + 1}`,
 *       showFavicon: true
 *     }))
 *   }
 *
 *   hasSources(message) {
 *     return this.extractSources(message).length > 0
 *   }
 *
 *   transformContentWithSources(content, sources) {
 *     // Replace citation markers [1], [2], etc. with Source components
 *     let transformed = content
 *     sources.forEach((source, idx) => {
 *       const marker = `[${idx + 1}]`
 *       const sourceTag = `<Source href="${source.href}" title="${source.title}" label="${source.label}" />`
 *       transformed = transformed.replace(marker, sourceTag)
 *     })
 *     return transformed
 *   }
 * }
 *
 * // Then in your Markdown component or chat-interface:
 * import { sourceAdapter } from "@/lib/adapters/source-adapter"
 * import { Source, SourceTrigger, SourceContent } from "@/components/prompt-kit/source"
 *
 * // In message rendering:
 * {sourceAdapter.hasSources(message) && (
 *   <div className="mt-2 flex flex-wrap gap-2">
 *     {sourceAdapter.extractSources(message).map((source) => (
 *       <Source key={source.id} href={source.href}>
 *         <SourceTrigger label={source.label} showFavicon={source.showFavicon} />
 *         <SourceContent title={source.title} description={source.description} />
 *       </Source>
 *     ))}
 *   </div>
 * )}
 */

// Singleton instance - swap this out when you implement the adapter
export const sourceAdapter: SourceAdapter = new DefaultSourceAdapter()
