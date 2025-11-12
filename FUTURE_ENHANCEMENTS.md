# LM Chat UI - Future Enhancements Plan

## Overview
This document outlines the comprehensive plan for enhancing the LM Chat UI to support advanced features including MCP (Model Context Protocol) servers, RAG (Retrieval Augmented Generation) pipelines, MDX components, and tool use visualization.

---

## 1. MCP Server Integration

### 1.1 Objective
Enable the chat UI to connect to and interact with MCP servers, displaying server capabilities, managing connections, and visualizing server responses.

### 1.2 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Chat UI (Frontend)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │ MCP Connection │  │ Tool Execution │  │ Resource View │ │
│  │    Manager     │  │    Panel       │  │    Panel      │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    MCP Client Layer                          │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │Server Discovery│  │  Tool Calling  │  │   Resources   │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                     API Layer (Edge)                         │
│  /api/mcp/connect  /api/mcp/tools  /api/mcp/resources       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  MCP Servers     │
                    │  - File System   │
                    │  - Database      │
                    │  - Web Search    │
                    │  - Custom Tools  │
                    └──────────────────┘
```

### 1.3 Implementation Plan

#### Phase 1: MCP Client Foundation
**Files to Create:**
- `/app/lib/mcp/client.ts` - MCP client implementation
- `/app/lib/mcp/types.ts` - MCP protocol types
- `/app/lib/mcp/transport.ts` - WebSocket/HTTP transport layer
- `/app/types/mcp.ts` - TypeScript interfaces for MCP

**Core Features:**
```typescript
// MCP Client interface
interface MCPClient {
  connect(serverUrl: string, config: ServerConfig): Promise<Connection>
  disconnect(): Promise<void>
  listTools(): Promise<Tool[]>
  callTool(name: string, params: any): Promise<ToolResult>
  getResources(): Promise<Resource[]>
  subscribe(eventType: string, callback: Function): void
}

// Server configuration
interface ServerConfig {
  url: string
  name: string
  transport: 'ws' | 'http' | 'stdio'
  authentication?: {
    type: 'apiKey' | 'oauth' | 'none'
    credentials?: any
  }
}

// Tool definition
interface Tool {
  name: string
  description: string
  parameters: {
    type: string
    properties: Record<string, any>
    required?: string[]
  }
}
```

#### Phase 2: UI Components
**Files to Create:**
- `/app/components/mcp/server-manager.tsx` - Server connection management UI
- `/app/components/mcp/tool-panel.tsx` - Available tools display
- `/app/components/mcp/tool-execution-card.tsx` - Tool execution results
- `/app/components/mcp/resource-browser.tsx` - Browse MCP resources
- `/app/components/mcp/connection-status.tsx` - Server status indicator

**UI Features:**
1. **Server Manager Panel:**
   - Add/remove MCP servers
   - View server capabilities
   - Connection status indicators
   - Auto-reconnect logic
   - Server-specific settings

2. **Tool Panel:**
   - List all available tools from connected servers
   - Search and filter tools
   - Tool documentation viewer
   - Quick tool execution
   - Parameter form builder

3. **Tool Execution Card:**
   ```tsx
   <ToolExecutionCard
     toolName="search_files"
     status="success" | "pending" | "error"
     parameters={{ query: "*.tsx", path: "/src" }}
     result={/* tool response */}
     timestamp={Date}
     onRetry={() => {}}
   />
   ```

#### Phase 3: Store Integration
**Updates to `/app/lib/store.ts`:**
```typescript
interface MCPState {
  servers: Map<string, MCPServer>
  activeServerId: string | null
  tools: Map<string, Tool[]> // serverId -> tools
  toolExecutions: ToolExecution[]
  resources: Map<string, Resource[]>
}

interface MCPServer {
  id: string
  url: string
  name: string
  status: 'connected' | 'disconnected' | 'connecting' | 'error'
  capabilities: ServerCapabilities
  lastConnected: Date
  config: ServerConfig
}

interface ToolExecution {
  id: string
  serverId: string
  toolName: string
  parameters: any
  result: any
  status: 'pending' | 'success' | 'error'
  timestamp: Date
  duration?: number
}

// Store actions
const useMCPStore = create<MCPState>((set, get) => ({
  servers: new Map(),
  activeServerId: null,
  tools: new Map(),
  toolExecutions: [],
  resources: new Map(),

  // Actions
  connectServer: async (config: ServerConfig) => {},
  disconnectServer: (serverId: string) => {},
  executeTool: async (serverId: string, toolName: string, params: any) => {},
  fetchResources: async (serverId: string) => {},
  setActiveServer: (serverId: string) => {},
}))
```

#### Phase 4: Message Integration
**Extend message system to show tool use:**
```typescript
interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: string
  provider?: string
  // NEW: Tool use tracking
  toolUse?: {
    toolName: string
    serverId: string
    parameters: any
    result?: any
    status: 'pending' | 'success' | 'error'
  }[]
}
```

**Chat Interface Updates:**
- Display tool calls inline with messages
- Show tool execution progress
- Render tool results with proper formatting
- Allow retry of failed tool calls

---

## 2. RAG Pipeline Integration

### 2.1 Objective
Enable Retrieval Augmented Generation by integrating vector databases, document processing, and context injection into the chat flow.

### 2.2 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Chat UI Layer                            │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │  Document      │  │   Context      │  │   Source      │ │
│  │  Upload UI     │  │   Viewer       │  │   Citations   │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    RAG Orchestration                         │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │Query Transform │  │ Vector Search  │  │Context Builder│ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Vector Database                           │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │  Embeddings    │  │   Indexing     │  │   Retrieval   │ │
│  │  (OpenAI/etc)  │  │  (Pinecone/    │  │   (Semantic)  │ │
│  │                │  │   Qdrant/etc)  │  │               │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Implementation Plan

#### Phase 1: Document Processing
**Files to Create:**
- `/app/lib/rag/document-processor.ts` - Parse and chunk documents
- `/app/lib/rag/embeddings.ts` - Generate embeddings
- `/app/lib/rag/vector-store.ts` - Vector database interface

**Document Processing Pipeline:**
```typescript
interface DocumentProcessor {
  // Parse different file formats
  parse(file: File): Promise<Document>

  // Chunk document into smaller pieces
  chunk(document: Document, options: ChunkOptions): Chunk[]

  // Generate embeddings for chunks
  embed(chunks: Chunk[]): Promise<EmbeddedChunk[]>

  // Index in vector store
  index(chunks: EmbeddedChunk[]): Promise<IndexResult>
}

interface Chunk {
  id: string
  content: string
  metadata: {
    documentId: string
    source: string
    page?: number
    section?: string
    timestamp: Date
  }
  startIndex: number
  endIndex: number
}

interface EmbeddedChunk extends Chunk {
  embedding: number[]
  embeddingModel: string
}

// Supported formats
type DocumentFormat =
  | 'pdf'
  | 'docx'
  | 'txt'
  | 'md'
  | 'html'
  | 'csv'
  | 'json'
```

#### Phase 2: Retrieval System
**Files to Create:**
- `/app/lib/rag/retriever.ts` - Semantic search and retrieval
- `/app/lib/rag/reranker.ts` - Rerank results for relevance
- `/app/lib/rag/context-builder.ts` - Build context from retrieved chunks

**Retrieval Interface:**
```typescript
interface Retriever {
  // Semantic search
  search(query: string, options: SearchOptions): Promise<SearchResult[]>

  // Hybrid search (semantic + keyword)
  hybridSearch(query: string, options: HybridOptions): Promise<SearchResult[]>

  // Rerank results
  rerank(results: SearchResult[], query: string): Promise<SearchResult[]>
}

interface SearchOptions {
  topK?: number // number of results to return
  threshold?: number // minimum similarity score
  filters?: {
    documentId?: string
    source?: string
    dateRange?: [Date, Date]
    tags?: string[]
  }
}

interface SearchResult {
  chunk: Chunk
  score: number
  highlights?: string[]
  metadata: any
}
```

#### Phase 3: Context Integration
**Context Builder:**
```typescript
interface ContextBuilder {
  // Build context from search results
  build(
    query: string,
    results: SearchResult[],
    options: ContextOptions
  ): ContextResult

  // Format context for LLM
  format(context: ContextResult, template: string): string
}

interface ContextOptions {
  maxTokens?: number
  includeMetadata?: boolean
  groupBySources?: boolean
  addCitations?: boolean
}

interface ContextResult {
  text: string
  sources: Source[]
  tokens: number
  truncated: boolean
}

interface Source {
  id: string
  title: string
  url?: string
  excerpt: string
  score: number
  metadata: any
}
```

#### Phase 4: UI Components
**Files to Create:**
- `/app/components/rag/document-uploader.tsx` - Upload and process documents
- `/app/components/rag/knowledge-base-manager.tsx` - Manage indexed documents
- `/app/components/rag/context-panel.tsx` - Show retrieved context
- `/app/components/rag/source-citations.tsx` - Display source citations
- `/app/components/rag/rag-settings.tsx` - Configure RAG parameters

**UI Features:**

1. **Document Uploader:**
   ```tsx
   <DocumentUploader
     onUpload={async (files) => {
       // Process and index documents
       for (const file of files) {
         await processAndIndex(file)
       }
     }}
     acceptedFormats={['pdf', 'docx', 'txt', 'md']}
     maxSize={10 * 1024 * 1024} // 10MB
     showProgress={true}
   />
   ```

2. **Context Panel:**
   - Show retrieved chunks inline with chat
   - Highlight relevance scores
   - Allow expanding/collapsing context
   - Show document sources with links

3. **Source Citations:**
   ```tsx
   <SourceCitations
     sources={[
       {
         id: '1',
         title: 'Product Documentation',
         excerpt: '...',
         score: 0.92,
         url: '/docs/product.pdf#page=12'
       }
     ]}
     onSourceClick={(source) => {
       // Navigate to source or show preview
     }}
   />
   ```

#### Phase 5: Store Integration
**Updates to `/app/lib/store.ts`:**
```typescript
interface RAGState {
  documents: Map<string, IndexedDocument>
  knowledgeBases: KnowledgeBase[]
  activeKnowledgeBaseId: string | null
  ragEnabled: boolean
  ragSettings: RAGSettings
}

interface IndexedDocument {
  id: string
  filename: string
  filesize: number
  format: DocumentFormat
  uploadedAt: Date
  chunks: number
  status: 'processing' | 'indexed' | 'error'
  error?: string
  metadata: any
}

interface KnowledgeBase {
  id: string
  name: string
  description: string
  documentIds: string[]
  createdAt: Date
  updatedAt: Date
  settings: {
    embeddingModel: string
    chunkSize: number
    chunkOverlap: number
  }
}

interface RAGSettings {
  topK: number
  similarityThreshold: number
  includeMetadata: boolean
  enableReranking: boolean
  contextTemplate: string
  showCitations: boolean
}

// Store actions
const useRAGStore = create<RAGState>((set, get) => ({
  documents: new Map(),
  knowledgeBases: [],
  activeKnowledgeBaseId: null,
  ragEnabled: false,
  ragSettings: defaultRAGSettings,

  // Actions
  uploadDocument: async (file: File) => {},
  deleteDocument: (documentId: string) => {},
  createKnowledgeBase: (name: string, description: string) => {},
  addDocumentToKnowledgeBase: (kbId: string, docId: string) => {},
  setActiveKnowledgeBase: (kbId: string | null) => {},
  updateRAGSettings: (settings: Partial<RAGSettings>) => {},
  toggleRAG: () => {},
}))
```

#### Phase 6: Chat Integration
**Modified Chat Flow with RAG:**
```typescript
// In handleSubmit
const handleSubmitWithRAG = async () => {
  const userMessage = input.trim()

  // 1. Add user message
  addMessage(chatId, {
    role: 'user',
    content: userMessage
  })

  // 2. If RAG enabled, retrieve context
  let context: ContextResult | null = null
  if (ragEnabled && activeKnowledgeBaseId) {
    const results = await retriever.search(userMessage, {
      topK: ragSettings.topK,
      threshold: ragSettings.similarityThreshold
    })

    context = contextBuilder.build(userMessage, results, {
      maxTokens: 2000,
      addCitations: ragSettings.showCitations
    })
  }

  // 3. Build prompt with context
  const prompt = context
    ? buildRAGPrompt(userMessage, context)
    : userMessage

  // 4. Send to LLM with context
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      messages: [...previousMessages, { role: 'user', content: prompt }],
      model: currentChat.model,
      provider: currentChat.provider,
      // Pass context metadata for display
      ragContext: context
    })
  })

  // 5. Display response with citations
  const assistantMessage = await response.json()
  addMessage(chatId, {
    role: 'assistant',
    content: assistantMessage.content,
    ragSources: context?.sources // Show sources inline
  })
}
```

**RAG Prompt Template:**
```
You are a helpful assistant. Answer the user's question based on the following context.

Context:
{context}

Sources:
{sources}

User Question: {query}

Instructions:
- Answer based primarily on the provided context
- If the context doesn't contain enough information, say so
- Cite sources using [1], [2], etc.
- Be concise and accurate

Answer:
```

---

## 3. MDX Component Support

### 3.1 Objective
Enable the AI to generate and render interactive MDX components within chat responses, allowing for rich, interactive content beyond markdown.

### 3.2 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Message Renderer                          │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │     Markdown   │  │      MDX       │  │   Component   │ │
│  │     Parser     │  │    Compiler    │  │    Registry   │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                  Component Sandbox                           │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │  Safe Eval     │  │   Props       │  │    State      │ │
│  │  Environment   │  │  Validation    │  │  Management   │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Implementation Plan

#### Phase 1: MDX Parser and Compiler
**Files to Create:**
- `/app/lib/mdx/compiler.ts` - MDX compilation
- `/app/lib/mdx/parser.ts` - Detect MDX in responses
- `/app/lib/mdx/sandbox.ts` - Safe execution environment

**Dependencies to Add:**
```bash
npm install @mdx-js/mdx @mdx-js/react
```

**MDX Compiler Interface:**
```typescript
interface MDXCompiler {
  // Compile MDX to React component
  compile(mdx: string): Promise<CompiledMDX>

  // Validate MDX syntax
  validate(mdx: string): ValidationResult

  // Extract components used
  extractComponents(mdx: string): string[]
}

interface CompiledMDX {
  component: React.ComponentType
  frontmatter?: Record<string, any>
  dependencies: string[]
}

interface ValidationResult {
  valid: boolean
  errors?: string[]
  warnings?: string[]
}
```

#### Phase 2: Component Registry
**Files to Create:**
- `/app/components/mdx/registry.tsx` - Available MDX components
- `/app/components/mdx/components/*` - Individual MDX components

**Built-in Components:**
```typescript
// Component registry
const MDXComponents = {
  // Interactive components
  Counter: dynamic(() => import('./components/Counter')),
  Chart: dynamic(() => import('./components/Chart')),
  Table: dynamic(() => import('./components/Table')),
  CodeEditor: dynamic(() => import('./components/CodeEditor')),
  Quiz: dynamic(() => import('./components/Quiz')),
  Slider: dynamic(() => import('./components/Slider')),

  // Data visualization
  LineChart: dynamic(() => import('./components/LineChart')),
  BarChart: dynamic(() => import('./components/BarChart')),
  PieChart: dynamic(() => import('./components/PieChart')),

  // Media
  Video: dynamic(() => import('./components/Video')),
  Audio: dynamic(() => import('./components/Audio')),
  Image: dynamic(() => import('./components/Image')),

  // Layout
  Tabs: dynamic(() => import('./components/Tabs')),
  Accordion: dynamic(() => import('./components/Accordion')),
  Grid: dynamic(() => import('./components/Grid')),
  Card: dynamic(() => import('./components/Card')),

  // Interactive elements
  Button: dynamic(() => import('./components/Button')),
  Input: dynamic(() => import('./components/Input')),
  Select: dynamic(() => import('./components/Select')),

  // Special
  Mermaid: dynamic(() => import('./components/Mermaid')), // Diagrams
  Math: dynamic(() => import('./components/Math')), // LaTeX
  Diff: dynamic(() => import('./components/Diff')), // Code diffs
}
```

**Example MDX Component:**
```tsx
// components/mdx/components/Counter.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface CounterProps {
  initialValue?: number
  step?: number
  min?: number
  max?: number
}

export function Counter({
  initialValue = 0,
  step = 1,
  min = -Infinity,
  max = Infinity
}: CounterProps) {
  const [count, setCount] = useState(initialValue)

  const increment = () => setCount(c => Math.min(c + step, max))
  const decrement = () => setCount(c => Math.max(c - step, min))

  return (
    <div className="flex items-center gap-4 rounded-lg border p-4">
      <Button onClick={decrement} disabled={count <= min}>
        -
      </Button>
      <span className="text-2xl font-bold">{count}</span>
      <Button onClick={increment} disabled={count >= max}>
        +
      </Button>
    </div>
  )
}
```

**Example MDX in Chat:**
```mdx
Here's an interactive counter for you:

<Counter initialValue={10} step={5} min={0} max={100} />

You can increment and decrement the value. It's bounded between 0 and 100.
```

#### Phase 3: Safe Sandbox
**Security Considerations:**
```typescript
interface SandboxOptions {
  // Allowed components
  allowedComponents: string[]

  // Prop validation
  validateProps: boolean

  // Execution limits
  maxExecutionTime: number
  maxMemory: number

  // Feature restrictions
  disableNetworkAccess: boolean
  disableLocalStorage: boolean
  disableEventListeners: string[] // e.g., ['onBeforeUnload']
}

class MDXSandbox {
  constructor(options: SandboxOptions) {}

  // Execute MDX in sandbox
  async execute(mdx: CompiledMDX): Promise<React.ReactNode> {
    // Validate component usage
    this.validateComponents(mdx.dependencies)

    // Create isolated execution context
    const context = this.createContext()

    // Execute with timeout
    return this.executeWithTimeout(mdx, context)
  }

  private validateComponents(deps: string[]): void {
    // Check against allowed list
  }

  private createContext(): ExecutionContext {
    // Create restricted environment
  }

  private executeWithTimeout(
    mdx: CompiledMDX,
    context: ExecutionContext
  ): Promise<React.ReactNode> {
    // Execute with resource limits
  }
}
```

#### Phase 4: Message Renderer
**Files to Update:**
- `/app/components/prompt-kit/message.tsx` - Add MDX rendering

**Enhanced Message Content:**
```tsx
'use client'

import { MDXProvider } from '@mdx-js/react'
import { MDXCompiler } from '@/lib/mdx/compiler'
import { MDXComponents } from '@/components/mdx/registry'
import { useEffect, useState } from 'react'

export function MessageContent({
  children,
  markdown = false,
  enableMDX = true
}: MessageContentProps) {
  const [compiledMDX, setCompiledMDX] = useState<CompiledMDX | null>(null)
  const content = String(children)

  useEffect(() => {
    if (!enableMDX) return

    // Check if content contains MDX components
    if (containsMDXComponents(content)) {
      const compiler = new MDXCompiler()
      compiler.compile(content).then(setCompiledMDX)
    }
  }, [content, enableMDX])

  // Render MDX if compiled
  if (compiledMDX) {
    return (
      <MDXProvider components={MDXComponents}>
        <div className="mdx-content">
          {compiledMDX.component}
        </div>
      </MDXProvider>
    )
  }

  // Fallback to markdown
  return markdown ? (
    <ReactMarkdown>{content}</ReactMarkdown>
  ) : (
    <div>{content}</div>
  )
}

function containsMDXComponents(content: string): boolean {
  // Check for component tags
  return /<[A-Z][a-zA-Z]*/.test(content)
}
```

#### Phase 5: AI Integration
**Prompt Engineering for MDX:**
```typescript
// System prompt addition
const MDX_SYSTEM_PROMPT = `
You can use MDX components in your responses to create interactive content.

Available components:
- <Counter initialValue={0} step={1} min={0} max={100} />
- <Chart data={[...]} type="line|bar|pie" />
- <Tabs items={[{label: "Tab 1", content: "..."}]} />
- <CodeEditor language="javascript" code="..." editable={true} />
- <Quiz questions={[...]} />
- <Mermaid chart="graph TD; A-->B" />

Example usage:
\`\`\`mdx
Here's an interactive demonstration:

<Counter initialValue={5} step={2} />

And here's a chart:

<Chart
  data={[
    { label: 'Jan', value: 30 },
    { label: 'Feb', value: 45 }
  ]}
  type="bar"
/>
\`\`\`

Use these components when they enhance the explanation or provide better interaction than plain text.
`

// Add to chat context
const buildSystemPrompt = () => {
  return [
    BASE_SYSTEM_PROMPT,
    mdxEnabled ? MDX_SYSTEM_PROMPT : '',
    ragEnabled ? RAG_SYSTEM_PROMPT : ''
  ].filter(Boolean).join('\n\n')
}
```

---

## 4. Tool Use Visualization

### 4.1 Objective
Provide clear, visual feedback when the AI uses tools, making the process transparent and debuggable.

### 4.2 Implementation Plan

#### Phase 1: Tool Use Detection
**Extend Message Type:**
```typescript
interface Message {
  // ... existing fields

  // Tool use metadata
  toolCalls?: ToolCall[]
}

interface ToolCall {
  id: string
  type: 'function' | 'mcp_tool' | 'rag_search'
  name: string
  parameters: any
  result?: any
  status: 'pending' | 'success' | 'error'
  timestamp: Date
  duration?: number
  error?: string
}
```

#### Phase 2: Tool Use Components
**Files to Create:**
- `/app/components/tool-use/tool-call-card.tsx` - Display tool execution
- `/app/components/tool-use/tool-timeline.tsx` - Show execution timeline
- `/app/components/tool-use/tool-result-viewer.tsx` - Format tool results

**Tool Call Card:**
```tsx
<ToolCallCard
  toolCall={{
    id: '123',
    type: 'function',
    name: 'search_files',
    parameters: { query: '*.tsx', path: '/src' },
    result: [...],
    status: 'success',
    duration: 245
  }}
  onRetry={() => {}}
  onViewDetails={() => {}}
/>
```

**Renders as:**
```
┌──────────────────────────────────────────────────┐
│ 🔧 search_files                        245ms ✓   │
├──────────────────────────────────────────────────┤
│ Parameters:                                      │
│   query: "*.tsx"                                 │
│   path: "/src"                                   │
│                                                  │
│ Results: 12 files found                         │
│   ▸ Show details                                │
└──────────────────────────────────────────────────┘
```

#### Phase 3: Inline Tool Visualization
**Integration with Messages:**
```tsx
// In chat-interface.tsx
{message.toolCalls && message.toolCalls.length > 0 && (
  <div className="my-4 space-y-2">
    <div className="text-xs font-semibold text-muted-foreground">
      Tool Usage
    </div>
    {message.toolCalls.map(toolCall => (
      <ToolCallCard
        key={toolCall.id}
        toolCall={toolCall}
        compact={true}
      />
    ))}
  </div>
)}
```

---

## 5. Settings and Configuration

### 5.1 Enhanced Settings Panel
**New Settings Sections:**

```typescript
interface AppSettings {
  // Existing settings
  theme: 'light' | 'dark' | 'system'
  apiKeys: {
    openai?: string
    anthropic?: string
  }
  defaultModel: string
  defaultProvider: string

  // NEW: MCP Settings
  mcp: {
    enabled: boolean
    servers: ServerConfig[]
    autoConnect: boolean
    showToolPanel: boolean
  }

  // NEW: RAG Settings
  rag: {
    enabled: boolean
    provider: 'pinecone' | 'qdrant' | 'local'
    embeddingModel: string
    apiKey?: string
    topK: number
    similarityThreshold: number
    showSources: boolean
  }

  // NEW: MDX Settings
  mdx: {
    enabled: boolean
    allowedComponents: string[]
    enableSandbox: boolean
    maxExecutionTime: number
  }

  // NEW: Advanced
  advanced: {
    enableDebugMode: boolean
    logLevel: 'error' | 'warn' | 'info' | 'debug'
    maxContextLength: number
    streamingEnabled: boolean
  }
}
```

---

## 6. Implementation Timeline

### Phase 1 (Week 1-2): MCP Foundation
- [ ] Implement MCP client
- [ ] Create server manager UI
- [ ] Add tool panel
- [ ] Integrate with chat

### Phase 2 (Week 3-4): RAG Foundation
- [ ] Implement document processor
- [ ] Set up vector store
- [ ] Create retrieval system
- [ ] Add document uploader UI

### Phase 3 (Week 5-6): RAG Integration
- [ ] Integrate RAG with chat flow
- [ ] Add context panel
- [ ] Implement source citations
- [ ] Create knowledge base manager

### Phase 4 (Week 7-8): MDX Support
- [ ] Set up MDX compiler
- [ ] Create component registry
- [ ] Implement sandbox
- [ ] Add built-in components

### Phase 5 (Week 9-10): Tool Use Visualization
- [ ] Create tool call cards
- [ ] Add tool timeline
- [ ] Implement result viewer
- [ ] Integrate with messages

### Phase 6 (Week 11-12): Polish & Testing
- [ ] Add comprehensive settings
- [ ] Write documentation
- [ ] Add example configurations
- [ ] Performance optimization
- [ ] Security audit

---

## 7. API Route Structure

### New API Routes Needed

```
/api/mcp/
  ├── connect       POST   - Connect to MCP server
  ├── disconnect    POST   - Disconnect from server
  ├── tools         GET    - List available tools
  ├── execute       POST   - Execute tool
  └── resources     GET    - Get server resources

/api/rag/
  ├── upload        POST   - Upload document
  ├── process       POST   - Process document
  ├── search        POST   - Semantic search
  ├── documents     GET    - List documents
  └── delete        DELETE - Delete document

/api/mdx/
  ├── compile       POST   - Compile MDX
  ├── validate      POST   - Validate MDX syntax
  └── components    GET    - List available components

/api/tools/
  ├── list          GET    - List all tools (MCP + built-in)
  └── execute       POST   - Execute any tool
```

---

## 8. Database Schema

### For persistence (optional, can use localStorage initially)

```sql
-- MCP Servers
CREATE TABLE mcp_servers (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  config JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  filesize INTEGER,
  format TEXT,
  content TEXT,
  metadata JSON,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending'
);

-- Document Chunks
CREATE TABLE chunks (
  id TEXT PRIMARY KEY,
  document_id TEXT REFERENCES documents(id),
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI embedding dimension
  metadata JSON,
  start_index INTEGER,
  end_index INTEGER
);

-- Knowledge Bases
CREATE TABLE knowledge_bases (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  settings JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- KB Documents relationship
CREATE TABLE kb_documents (
  knowledge_base_id TEXT REFERENCES knowledge_bases(id),
  document_id TEXT REFERENCES documents(id),
  PRIMARY KEY (knowledge_base_id, document_id)
);

-- Tool Executions (for history/debugging)
CREATE TABLE tool_executions (
  id TEXT PRIMARY KEY,
  chat_id TEXT,
  message_id TEXT,
  tool_name TEXT NOT NULL,
  parameters JSON,
  result JSON,
  status TEXT,
  duration_ms INTEGER,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 9. Security Considerations

### MCP Security
- Validate all server URLs
- Implement connection timeouts
- Sanitize tool parameters
- Rate limit tool executions
- Audit tool usage logs

### RAG Security
- Validate uploaded files
- Scan for malware
- Limit file sizes
- Sandboxed document processing
- Sanitize extracted content
- Restrict vector queries

### MDX Security
- Component whitelist only
- Props validation
- Execution timeouts
- Memory limits
- No network access from components
- No localStorage/cookie access
- CSP headers for sandbox

---

## 10. Testing Strategy

### Unit Tests
- MCP client connection/disconnection
- Tool parameter validation
- Document chunking algorithms
- Embedding generation
- MDX compilation
- Component rendering

### Integration Tests
- End-to-end RAG pipeline
- MCP tool execution flow
- MDX component interaction
- Error handling across layers

### E2E Tests
- Upload document → search → retrieve
- Connect MCP → execute tool → display result
- Send message with MDX → render component
- Multi-tool usage in single conversation

---

## 11. Documentation Needed

### User Documentation
- `/docs/mcp-setup.md` - Setting up MCP servers
- `/docs/rag-guide.md` - Using RAG features
- `/docs/mdx-components.md` - Available MDX components
- `/docs/tool-use.md` - Understanding tool execution

### Developer Documentation
- `/docs/dev/mcp-integration.md` - Adding new MCP servers
- `/docs/dev/rag-architecture.md` - RAG system internals
- `/docs/dev/mdx-components.md` - Creating custom components
- `/docs/dev/api-reference.md` - API endpoints

---

## 12. Performance Optimizations

### MCP
- Connection pooling
- Tool result caching
- Parallel tool execution
- WebSocket keep-alive

### RAG
- Embedding caching
- Vector index optimization
- Chunk prefetching
- Lazy loading of documents

### MDX
- Component code splitting
- Lazy compilation
- Memoized rendering
- Virtual scrolling for long content

---

## Conclusion

This plan provides a comprehensive roadmap for transforming the LM Chat UI into a powerful, extensible platform supporting:

1. **MCP Integration** - Connect to any MCP server and use tools seamlessly
2. **RAG Pipelines** - Upload documents, retrieve context, and generate informed responses
3. **MDX Components** - Rich, interactive content within chat messages
4. **Tool Visualization** - Clear, debuggable tool execution feedback

Each phase builds on the previous, allowing for incremental development and testing. The architecture is designed to be modular, maintainable, and extensible for future enhancements.
