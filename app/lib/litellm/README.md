# LiteLLM Client

A clean communication bridge between ChatUI and LiteLLM API for managing virtual keys and capabilities.

## Features

- **Virtual Key Management** - Generate keys with complete capability information
- **Automatic Capability Detection** - Parses model info to determine features
- **Pluggable Caching** - Ready for Redis/Vercel KV integration
- **Type-Safe** - Full TypeScript support
- **Error Handling** - Friendly error messages with suggested actions

## Installation

The client is already available in your project at `@/lib/litellm`.

## Quick Start

```typescript
import { LiteLLMClient } from '@/lib/litellm'

// Initialize client (typically in your server/API routes)
const client = new LiteLLMClient({
  baseURL: process.env.LITELLM_BASE_URL!,
  masterKey: process.env.LITELLM_MASTER_KEY!
})

// When user logs in, request a virtual key
const keyInfo = await client.requestKey({
  user_id: 'user-123',
  team_id: 'team-456',
  duration: '24h'
})

// Use the returned info to configure your UI
console.log(keyInfo)
// {
//   key: 'sk-litellm-abc123...',
//   models: [
//     { id: 'gpt-4', name: 'GPT-4', provider: 'openai', mode: 'chat', ... },
//     { id: 'dall-e-3', name: 'DALL-E 3', provider: 'openai', mode: 'image_generation', ... }
//   ],
//   features: {
//     chat: true,
//     imageGeneration: true,
//     audioTranscription: false,
//     ...
//   },
//   budget: {
//     max: 100,
//     spent: 0,
//     remaining: 100
//   },
//   tags: ['premium', 'team-marketing']
// }
```

## Usage

### Requesting a Virtual Key

When a user logs in, generate a virtual key for their session:

```typescript
const keyInfo = await client.requestKey({
  user_id: 'user-123',
  team_id: 'team-456',  // Optional
  duration: '24h',       // Optional, defaults to LiteLLM config
  models: ['gpt-4', 'dall-e-3'], // Optional, LiteLLM decides if not provided
  max_budget: 50,        // Optional
  tags: ['premium']      // Optional
})
```

### Using the Key Info

The returned `VirtualKeyInfo` object contains everything you need:

```typescript
// Store the key for making requests
sessionStorage.set('litellm_key', keyInfo.key)

// Configure UI based on features
if (keyInfo.features.chat) {
  // Show chat interface
}

if (keyInfo.features.imageGeneration) {
  // Show image generation button
}

if (keyInfo.features.audioTranscription) {
  // Show audio upload
}

// Check budget
if (keyInfo.budget) {
  console.log(`Remaining: $${keyInfo.budget.remaining}`)
}

// Use models in dropdown
const modelOptions = keyInfo.models.map(m => ({
  value: m.id,
  label: m.name
}))
```

## Configuration

### Basic Configuration

```typescript
const client = new LiteLLMClient({
  baseURL: 'https://litellm-api.up.railway.app',
  masterKey: 'sk-master-...'
})
```

### With Custom Cache (Redis)

```typescript
import { createClient } from 'redis'

// Create Redis cache adapter
class RedisCache implements CacheAdapter {
  constructor(private redis: ReturnType<typeof createClient>) {}

  async get(key: string) {
    const value = await this.redis.get(key)
    return value ? JSON.parse(value) : null
  }

  async set(key: string, value: any, ttl?: number) {
    const serialized = JSON.stringify(value)
    if (ttl) {
      await this.redis.setEx(key, ttl, serialized)
    } else {
      await this.redis.set(key, serialized)
    }
  }

  async delete(key: string) {
    await this.redis.del(key)
  }

  async clear() {
    await this.redis.flushDb()
  }
}

// Use it
const redisClient = createClient({ url: process.env.REDIS_URL })
await redisClient.connect()

const client = new LiteLLMClient({
  baseURL: process.env.LITELLM_BASE_URL!,
  masterKey: process.env.LITELLM_MASTER_KEY!,
  cache: new RedisCache(redisClient)
})
```

## API Reference

### `client.requestKey(params)`

Generates a virtual key and returns complete capability information.

**Parameters:**
- `user_id` (optional): User identifier
- `team_id` (optional): Team identifier
- `duration` (optional): Key duration (e.g., "24h", "30d")
- `models` (optional): Array of model IDs to allow
- `max_budget` (optional): Maximum budget in USD
- `tags` (optional): Routing tags
- [See full list in types.ts](./types.ts)

**Returns:** `VirtualKeyInfo` object with:
- `key`: Virtual key token
- `models`: Array of models with capabilities
- `features`: Aggregated feature flags
- `budget`: Budget information (if set)
- `rateLimit`: Rate limit information (if set)
- `tags`: Routing tags
- `expiresAt`: Expiration date
- `userId`, `teamId`, `metadata`: Metadata

## Types

All types are exported from the main module:

```typescript
import type {
  LiteLLMConfig,
  VirtualKeyInfo,
  ModelInfo,
  Features,
  BudgetInfo,
  RateLimitInfo,
  LiteLLMError
} from '@/lib/litellm'
```

## Error Handling

All errors are thrown as `LiteLLMError` objects with helpful information:

```typescript
try {
  const keyInfo = await client.requestKey({ user_id: '123' })
} catch (error) {
  console.error(error.message)        // Human-readable message
  console.error(error.code)           // Error code
  console.error(error.suggestedAction) // What user should do
  console.error(error.retryable)      // Whether to retry
}
```

## Environment Variables

Required environment variables:

```bash
LITELLM_BASE_URL=https://litellm-api.up.railway.app
LITELLM_MASTER_KEY=sk-master-your-key-here
```

## Architecture

The client is built with separation of concerns:

```
litellm/
├── types.ts          - TypeScript definitions
├── cache.ts          - Cache abstraction (pluggable)
├── http-client.ts    - Base HTTP wrapper
├── capabilities.ts   - Feature aggregation logic
├── keys.ts           - Virtual key operations
├── client.ts         - Main orchestrator (what you use)
└── index.ts          - Public exports
```

Internally organized for maintainability, externally exposed as a simple API.

## Chat Completions

The client supports chat completions using Vercel AI SDK with LiteLLM as the provider.

### Non-Streaming Chat

```typescript
const keyInfo = await client.requestKey({ user_id: '123' })
const userClient = client.withKey(keyInfo.key)

const response = await userClient.chat({
  messages: [
    { role: 'system', content: 'You are a helpful assistant' },
    { role: 'user', content: 'What is TypeScript?' }
  ],
  tags: ['quality'], // Optional: routing tags
  temperature: 0.7,
  maxTokens: 500
})

console.log(response.content)
console.log(response.usage) // { promptTokens, completionTokens, totalTokens }
```

### Streaming Chat

```typescript
const stream = await userClient.chatStream({
  messages: [
    { role: 'user', content: 'Write me a story' }
  ],
  tags: ['budget'], // Route to cheaper model
  temperature: 0.9
})

// In Next.js API route:
return stream.toTextStreamResponse()

// Or stream manually:
for await (const chunk of stream.textStream) {
  console.log(chunk)
}
```

### Chat Options

All Vercel AI SDK parameters are supported:

- `messages` (required): Array of chat messages
- `model` (optional): Specific model ID (defaults to first available)
- `tags` (optional): Routing tags for LiteLLM
- `temperature`: Sampling temperature (0-2)
- `maxTokens`: Maximum tokens to generate
- `topP`: Nucleus sampling threshold
- `frequencyPenalty`: Frequency penalty
- `presencePenalty`: Presence penalty
- `stop`: Stop sequences
- `seed`: Deterministic output seed

### Multimodal Chat (Images & Files)

The client supports vision models and document understanding using simple utility functions:

#### Images

```typescript
import { image, imageFromBase64, createMultimodalMessage } from '@/lib/litellm'

// From URL
const response = await userClient.chat({
  messages: [
    createMultimodalMessage(
      "What's in this image?",
      [image('https://example.com/photo.jpg', 'image/jpeg')]
    )
  ],
  tags: ['vision']
})

// From base64
const response = await userClient.chat({
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: "Describe these images" },
        imageFromBase64(base64String1, 'image/jpeg'),
        imageFromBase64(base64String2, 'image/png')
      ]
    }
  ]
})

// Multiple images
const response = await userClient.chat({
  messages: [
    createMultimodalMessage(
      "Compare these screenshots",
      [
        image('https://example.com/before.png', 'image/png'),
        image('https://example.com/after.png', 'image/png')
      ]
    )
  ]
})
```

#### Files (PDFs, Documents)

```typescript
import { file, fileFromBase64 } from '@/lib/litellm'

// PDF from URL
const response = await userClient.chat({
  messages: [
    createMultimodalMessage(
      "Summarize this document",
      [file('https://example.com/report.pdf', 'application/pdf', 'report.pdf')]
    )
  ],
  tags: ['quality']
})

// PDF from base64
const response = await userClient.chat({
  messages: [
    createMultimodalMessage(
      "Extract key points from this PDF",
      [fileFromBase64(pdfBase64, 'application/pdf', 'document.pdf')]
    )
  ]
})
```

#### Text Files (CSV, TXT, RTF)

For text-based files, convert to text and include directly:

```typescript
import { fileFromText } from '@/lib/litellm'

// CSV data
const csvContent = `Name,Age,City
John,30,NYC
Jane,25,LA`

const response = await userClient.chat({
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Analyze this CSV data:\n\n' + csvContent }
      ]
    }
  ]
})
```

#### Helper Utilities

```typescript
import { getMimeType, bufferToBase64 } from '@/lib/litellm'

// Get mime type from filename
const mimeType = getMimeType('photo.jpg') // 'image/jpeg'
const mimeType2 = getMimeType('document.pdf') // 'application/pdf'

// Convert file buffer to base64 (Node.js)
const base64 = bufferToBase64(fileBuffer)
```

## Image Generation

Generate images from text prompts using models like DALL-E, Stable Diffusion, and more via LiteLLM.

### Basic Usage

```typescript
const response = await userClient.generateImages({
  prompt: 'A futuristic cityscape at sunset with flying cars',
  model: 'dall-e-3',
  n: 1,
  size: '1024x1024'
})

// Access the generated image
const imageBase64 = response.image.base64
const imageUrl = `data:${response.image.mediaType};base64,${imageBase64}`

// Or work with multiple images
for (const img of response.images) {
  console.log(`Generated ${img.mediaType} image`)
  // img.base64 - base64 string
  // img.uint8Array - Uint8Array for file operations
}
```

### Options

```typescript
const response = await userClient.generateImages({
  prompt: 'An abstract painting in the style of Kandinsky',
  model: 'dall-e-3',         // Model ID (defaults to 'dall-e-3')
  n: 2,                      // Number of images to generate
  size: '1792x1024',         // Image dimensions
  aspectRatio: '16:9',       // Alternative to size
  seed: 42,                  // For reproducible generation
  tags: ['quality']          // Routing tags for LiteLLM
})
```

### Supported Sizes

Common sizes depend on the model:
- DALL-E 3: `1024x1024`, `1792x1024`, `1024x1792`
- DALL-E 2: `256x256`, `512x512`, `1024x1024`
- Stable Diffusion: Varies by provider

### Saving Images

```typescript
import fs from 'fs'

const response = await userClient.generateImages({
  prompt: 'A serene mountain landscape',
  model: 'dall-e-3'
})

// Save as file (Node.js)
fs.writeFileSync(
  'generated-image.png',
  Buffer.from(response.image.uint8Array)
)

// Or use base64 in HTML
const imgTag = `<img src="data:${response.image.mediaType};base64,${response.image.base64}" />`
```

### Using with Different Models

LiteLLM routes to different providers based on model name:

```typescript
// OpenAI DALL-E
await userClient.generateImages({ prompt: '...', model: 'dall-e-3' })

// Stable Diffusion (via various providers)
await userClient.generateImages({ prompt: '...', model: 'stabilityai/stable-diffusion-xl-base-1.0' })

// Use tags for routing through LiteLLM
await userClient.generateImages({
  prompt: '...',
  tags: ['fast', 'cheap']  // Route to fastest/cheapest available
})
```

## Function Calling / Tools

Enable AI models to call functions and use tools for structured outputs and agentic behavior.

### Basic Tool Usage

```typescript
import { tool } from 'ai'
import { z } from 'zod'

const response = await userClient.chat({
  messages: [
    { role: 'user', content: 'What is the weather in San Francisco?' }
  ],
  tools: {
    getWeather: tool({
      description: 'Get the current weather for a location',
      inputSchema: z.object({
        location: z.string().describe('The city and state, e.g. San Francisco, CA'),
      }),
      execute: async ({ location }) => {
        // Call your weather API
        const weather = await fetchWeather(location)
        return weather
      },
    }),
  },
})

console.log(response.content) // "The weather in San Francisco is 65°F and sunny"
console.log(response.toolCalls) // Array of tool calls made
console.log(response.toolResults) // Results from executed tools
```

### Multiple Tools

```typescript
import { tool } from 'ai'
import { z } from 'zod'

const response = await userClient.chat({
  messages: [
    { role: 'user', content: 'Get the weather in NYC and search for nearby restaurants' }
  ],
  tools: {
    getWeather: tool({
      description: 'Get weather for a location',
      inputSchema: z.object({
        location: z.string(),
      }),
      execute: async ({ location }) => fetchWeather(location),
    }),
    searchRestaurants: tool({
      description: 'Search for restaurants near a location',
      inputSchema: z.object({
        location: z.string(),
        cuisine: z.string().optional(),
      }),
      execute: async ({ location, cuisine }) => {
        return searchNearby(location, cuisine)
      },
    }),
  },
  maxSteps: 5, // Allow multi-step tool calling
})
```

### Tool Choice Control

```typescript
// Let model decide when to use tools
const response = await userClient.chat({
  messages: [{ role: 'user', content: 'Should I bring an umbrella?' }],
  tools: { getWeather: weatherTool },
  toolChoice: 'auto', // default
})

// Force model to use a tool
const response = await userClient.chat({
  messages: [{ role: 'user', content: 'Get the weather' }],
  tools: { getWeather: weatherTool },
  toolChoice: 'required', // Must call a tool
})

// Force specific tool
const response = await userClient.chat({
  messages: [{ role: 'user', content: 'Check conditions' }],
  tools: { getWeather: weatherTool },
  toolChoice: {
    type: 'tool',
    toolName: 'getWeather',
  },
})
```

### Multi-Step Agents

Enable the model to use tools multiple times in a loop:

```typescript
const response = await userClient.chat({
  messages: [
    {
      role: 'user',
      content: 'Find a restaurant in Seattle with good reviews and tell me the weather there',
    },
  ],
  tools: {
    searchRestaurants: restaurantTool,
    getWeather: weatherTool,
    getReviews: reviewsTool,
  },
  maxSteps: 10, // Allow up to 10 tool calls
})

// The model will:
// 1. Call searchRestaurants for Seattle
// 2. Call getReviews for top results
// 3. Call getWeather for Seattle
// 4. Synthesize a final answer

console.log(response.toolCalls) // All tool calls made
console.log(response.toolResults) // All results
console.log(response.content) // Final synthesized answer
```

### Streaming with Tools

Tools work with streaming too:

```typescript
const stream = await userClient.chatStream({
  messages: [{ role: 'user', content: 'What is the weather?' }],
  tools: { getWeather: weatherTool },
  maxSteps: 5,
})

// Stream text and tool calls
for await (const chunk of stream.textStream) {
  console.log(chunk)
}

// Or use in API route
return stream.toTextStreamResponse()
```

### Structured Output without Execution

Define tools without execute functions for structured output:

```typescript
const response = await userClient.chat({
  messages: [
    { role: 'user', content: 'Extract user info: John Doe, age 30, lives in NYC' },
  ],
  tools: {
    extractUser: tool({
      description: 'Extract structured user information',
      inputSchema: z.object({
        name: z.string(),
        age: z.number(),
        location: z.string(),
      }),
      // No execute - just get structured data
    }),
  },
  toolChoice: {
    type: 'tool',
    toolName: 'extractUser',
  },
})

const userData = response.toolCalls[0].args
console.log(userData) // { name: 'John Doe', age: 30, location: 'NYC' }
```

## Next Steps

Future additions:
- Audio transcription/generation
- RAG capabilities (embeddings, vector search, reranking)
- And more...

Each feature will be added as a separate module but exposed through the same simple client API.
