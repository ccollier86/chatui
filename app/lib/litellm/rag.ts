/**
 * RAG Service
 *
 * Handles embeddings, vector store search, and reranking for RAG applications
 */

import type {
  LiteLLMConfig,
  EmbeddingOptions,
  EmbeddingResponse,
  VectorSearchOptions,
  VectorSearchResponse,
  VectorSearchResult,
  RerankOptions,
  RerankResponse,
  RerankResult,
} from './types'
import type { HTTPClient } from './http-client'

export class RAGService {
  constructor(
    private http: HTTPClient,
    private config: LiteLLMConfig,
    private userKey?: string
  ) {}

  /**
   * Set user's virtual key for requests
   */
  setUserKey(key: string): void {
    this.userKey = key
  }

  /**
   * Generate embeddings from text
   *
   * @example
   * ```typescript
   * const response = await rag.embed({
   *   input: 'Hello world',
   *   model: 'text-embedding-ada-002'
   * })
   *
   * console.log(response.embeddings[0]) // [0.123, -0.456, ...]
   * console.log(response.usage.totalTokens) // 2
   * ```
   */
  async embed(options: EmbeddingOptions): Promise<EmbeddingResponse> {
    const { input, model = 'text-embedding-ada-002', ...params } = options

    // Build headers
    const headers: Record<string, string> = {}

    // Add user's virtual key if available
    if (this.userKey) {
      headers['Authorization'] = `Bearer ${this.userKey}`
    }

    // Call embeddings endpoint
    const response = await this.http.post(
      '/v1/embeddings',
      {
        model,
        input: Array.isArray(input) ? input : [input],
        dimensions: params.dimensions,
        encoding_format: params.encodingFormat,
      },
      { headers }
    )

    // Extract embeddings from response
    const embeddings = response.data.map((item: any) => item.embedding)

    // Return clean response
    return {
      embeddings,
      model: response.model,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        totalTokens: response.usage.total_tokens,
      },
    }
  }

  /**
   * Search a vector store
   *
   * @example
   * ```typescript
   * const response = await rag.search({
   *   vectorStoreId: 'vs_abc123',
   *   query: 'What is the capital of France?',
   *   maxResults: 5,
   *   scoreThreshold: 0.7
   * })
   *
   * for (const result of response.results) {
   *   console.log(`Score: ${result.score}`)
   *   console.log(`Content: ${result.content}`)
   * }
   * ```
   */
  async search(
    options: VectorSearchOptions
  ): Promise<VectorSearchResponse> {
    const {
      vectorStoreId,
      query,
      fileIds,
      maxResults,
      scoreThreshold,
      rewriteQuery,
    } = options

    // Build headers
    const headers: Record<string, string> = {}

    // Add user's virtual key if available
    if (this.userKey) {
      headers['Authorization'] = `Bearer ${this.userKey}`
    }

    // Build request body
    const body: Record<string, any> = {
      query,
    }

    if (fileIds && fileIds.length > 0) {
      body.filters = { file_ids: fileIds }
    }

    if (maxResults !== undefined) {
      body.max_num_results = maxResults
    }

    if (scoreThreshold !== undefined) {
      body.ranking_options = { score_threshold: scoreThreshold }
    }

    if (rewriteQuery !== undefined) {
      body.rewrite_query = rewriteQuery
    }

    // Call vector store search endpoint
    const response = await this.http.post(
      `/v1/vector_stores/${vectorStoreId}/search`,
      body,
      { headers }
    )

    // Parse results
    const results: VectorSearchResult[] = (response.results || []).map(
      (result: any) => ({
        id: result.id,
        score: result.score || result.relevance_score || 0,
        content: result.content || result.text || '',
        fileId: result.file_id,
        metadata: result.metadata,
      })
    )

    return {
      results,
      vectorStoreId,
    }
  }

  /**
   * Rerank documents by relevance to a query
   *
   * @example
   * ```typescript
   * const response = await rag.rerank({
   *   query: 'What is machine learning?',
   *   documents: [
   *     'Machine learning is a subset of AI...',
   *     'Cooking is the art of preparing food...',
   *     'Neural networks are computing systems...'
   *   ],
   *   topN: 2,
   *   model: 'rerank-english-v3.0'
   * })
   *
   * for (const result of response.results) {
   *   console.log(`Index: ${result.index}, Score: ${result.relevanceScore}`)
   * }
   * ```
   */
  async rerank(options: RerankOptions): Promise<RerankResponse> {
    const {
      query,
      documents,
      model = 'rerank-english-v3.0',
      topN,
      returnDocuments,
    } = options

    // Build headers
    const headers: Record<string, string> = {}

    // Add user's virtual key if available
    if (this.userKey) {
      headers['Authorization'] = `Bearer ${this.userKey}`
    }

    // Call rerank endpoint
    const response = await this.http.post(
      '/v1/rerank',
      {
        model,
        query,
        documents,
        top_n: topN,
        return_documents: returnDocuments,
      },
      { headers }
    )

    // Parse results
    const results: RerankResult[] = (response.results || []).map(
      (result: any) => ({
        index: result.index,
        relevanceScore: result.relevance_score,
        document: result.document?.text || result.document,
      })
    )

    return {
      results,
      model: response.model || model,
    }
  }
}
