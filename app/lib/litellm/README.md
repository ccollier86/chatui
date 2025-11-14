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

## Next Steps

This is just the virtual keys feature. Future additions:
- Chat completions (Vercel AI SDK compatible)
- Image generation
- Audio transcription/generation
- Embeddings
- And more...

Each feature will be added as a separate module but exposed through the same simple client API.
