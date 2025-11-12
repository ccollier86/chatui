# LiteLLM Integration Guide

This guide explains how to set up and use LiteLLM with your chat application.

## What is LiteLLM?

LiteLLM is a unified gateway that provides OpenAI-compatible access to 100+ LLM providers including:
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude 3.5, Claude 3)
- Google (Gemini Pro, Gemini 1.5)
- Meta (Llama 2, Llama 3)
- Mistral, Cohere, and many more

**Key Benefit:** Use a **single adapter** to access all providers instead of implementing separate adapters for each one.

## Architecture

```
Frontend → /api/models → LiteLLM Adapter → LiteLLM Proxy → Multiple Providers
                                                           ├─ OpenAI
                                                           ├─ Anthropic
                                                           ├─ Google
                                                           └─ 100+ more
```

## Setup Instructions

### 1. Install LiteLLM Proxy

**Option A: Using Docker (Recommended)**

```bash
docker run -d \
  -p 4000:4000 \
  -v $(pwd)/litellm_config.yaml:/app/config.yaml \
  -e LITELLM_MASTER_KEY=sk-your-secret-key \
  ghcr.io/berriai/litellm:main-latest \
  --config /app/config.yaml
```

**Option B: Using pip**

```bash
pip install litellm
litellm --config litellm_config.yaml
```

### 2. Configure LiteLLM

Create `litellm_config.yaml`:

```yaml
model_list:
  # OpenAI Models
  - model_name: gpt-4
    litellm_params:
      model: openai/gpt-4
      api_key: os.environ/OPENAI_API_KEY

  - model_name: gpt-3.5-turbo
    litellm_params:
      model: openai/gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

  # Anthropic Models
  - model_name: claude-3-5-sonnet-20241022
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY

  # Google Models
  - model_name: gemini-pro
    litellm_params:
      model: gemini/gemini-pro
      api_key: os.environ/GOOGLE_API_KEY

  # Meta Models (via Replicate)
  - model_name: llama-2-70b
    litellm_params:
      model: replicate/meta/llama-2-70b-chat
      api_key: os.environ/REPLICATE_API_KEY

  # Mistral Models
  - model_name: mistral-medium
    litellm_params:
      model: mistral/mistral-medium
      api_key: os.environ/MISTRAL_API_KEY

# Optional: Enable model fallbacks
litellm_settings:
  fallbacks: true
  num_retries: 2
```

### 3. Configure Application Environment Variables

Add to your `.env` file:

```bash
# Enable LiteLLM integration
LITELLM_ENABLED=true

# LiteLLM proxy URL (default: http://localhost:4000)
LITELLM_BASE_URL=http://localhost:4000

# Optional: API key if your LiteLLM proxy requires authentication
LITELLM_API_KEY=sk-your-litellm-key
```

### 4. Start Your Application

```bash
npm run dev
```

The application will:
1. Fetch models from `/api/models`
2. Combine hardcoded models with LiteLLM models
3. Display all available models in the UI

## How It Works

### 1. **Model Discovery**

The `litellm-adapter.ts` fetches models from LiteLLM:

```typescript
import { litellmAdapter } from "@/lib/adapters/litellm-adapter"

// Check if configured
if (litellmAdapter.isConfigured()) {
  // Fetch models from LiteLLM proxy
  const models = await litellmAdapter.fetchModels()
  console.log(models)
}
```

### 2. **API Endpoint**

`/api/models` combines hardcoded models with LiteLLM models:

```bash
GET /api/models

Response: [
  { id: "gpt-4", name: "GPT-4", provider: "litellm", contextWindow: 8192 },
  { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", provider: "litellm", contextWindow: 200000 },
  { id: "gemini-pro", name: "Gemini Pro", provider: "litellm", contextWindow: 32000 },
  ...
]
```

### 3. **Chat Route**

The chat API route detects `provider: "litellm"` and uses LiteLLM:

```typescript
if (provider === "litellm") {
  const config = litellmAdapter.getConfig()
  const litellm = createOpenAI({
    baseURL: config.baseURL,  // http://localhost:4000
    apiKey: config.apiKey
  })
  selectedModel = litellm(model)  // Works for ANY model!
}
```

### 4. **Frontend**

The UI automatically fetches and displays all models:

```typescript
const { availableModels, fetchModels } = useChatStore()

// Fetch on mount
useEffect(() => {
  fetchModels()
}, [])

// Models are grouped by provider: OpenAI, Anthropic, LiteLLM
```

## Features

### ✅ Dynamic Model Discovery
- No hardcoding required
- Add models in LiteLLM config → Instantly available in UI
- Models are cached for 5 minutes

### ✅ Single Adapter
- Unlike OpenAI/Anthropic which need separate adapters
- LiteLLM uses **one adapter** for all providers
- OpenAI-compatible API for everything

### ✅ Backward Compatible
- Existing OpenAI/Anthropic direct connections still work
- LiteLLM is opt-in (only enabled if configured)
- Gradual migration supported

### ✅ Intelligent Caching
- Models cached for 5 minutes
- Automatic refresh on cache expiration
- Manual refresh with `POST /api/models`

### ✅ Graceful Fallback
- If LiteLLM is down, uses cached models
- If never configured, uses hardcoded models
- No breaking changes

## Advanced Features

### Manual Cache Refresh

Force refresh the model cache:

```bash
POST /api/models

Response: {
  "success": true,
  "message": "Model cache refreshed",
  "count": 15
}
```

### Programmatic Access

```typescript
import { litellmAdapter } from "@/lib/adapters/litellm-adapter"

// Check configuration
if (litellmAdapter.isConfigured()) {
  console.log("LiteLLM is enabled")

  // Get config
  const config = litellmAdapter.getConfig()
  console.log("Base URL:", config.baseURL)

  // Clear cache
  litellmAdapter.clearCache()

  // Fetch fresh models
  const models = await litellmAdapter.fetchModels()
}
```

### Context Window Estimation

The adapter automatically estimates context windows:

- GPT-4 Turbo: 128,000
- Claude 3: 200,000
- Gemini 1.5 Pro: 1,000,000
- Llama 2: 4,096

These are approximations. For exact values, extend the adapter.

## Troubleshooting

### Models Not Showing Up

1. **Check LiteLLM is running:**
   ```bash
   curl http://localhost:4000/v1/models
   ```

2. **Check environment variables:**
   ```bash
   echo $LITELLM_ENABLED  # Should be "true"
   echo $LITELLM_BASE_URL # Should be your proxy URL
   ```

3. **Check browser console:**
   - Open DevTools → Console
   - Look for "Fetching models from LiteLLM"
   - Check for errors

4. **Check API response:**
   ```bash
   curl http://localhost:3000/api/models
   ```

### LiteLLM Proxy Connection Failed

- Ensure LiteLLM is running on port 4000
- Check Docker logs: `docker logs <container-id>`
- Verify `LITELLM_BASE_URL` matches your setup
- Try `http://localhost:4000` vs `http://127.0.0.1:4000`

### API Key Errors

- Verify API keys in `litellm_config.yaml`
- Check environment variables are exported
- Ensure `LITELLM_API_KEY` is set if proxy requires auth

## Migration Guide

### From Hardcoded Models to LiteLLM

1. **Keep existing setup** (no breaking changes)
2. **Install LiteLLM proxy**
3. **Add environment variables**
4. **Test with one model first**
5. **Gradually move models to LiteLLM**
6. **Disable direct OpenAI/Anthropic once confident**

### From Direct Providers to LiteLLM

**Before:**
```typescript
// Separate adapters for each provider
const openai = createOpenAI({ apiKey: OPENAI_KEY })
const anthropic = createAnthropic({ apiKey: ANTHROPIC_KEY })
const google = createGoogle({ apiKey: GOOGLE_KEY })
// ... one adapter per provider
```

**After:**
```typescript
// Single adapter for all providers
const litellm = createOpenAI({
  baseURL: "http://localhost:4000",
  apiKey: LITELLM_KEY
})
// Works for OpenAI, Anthropic, Google, Meta, and 100+ more!
```

## References

- [LiteLLM Documentation](https://docs.litellm.ai/)
- [AI SDK Documentation](https://ai-sdk.dev/)
- [Supported Providers](https://docs.litellm.ai/docs/providers)
- [LiteLLM GitHub](https://github.com/BerriAI/litellm)

## Support

For issues with:
- **LiteLLM Adapter**: Check `lib/adapters/litellm-adapter.ts`
- **Models API**: Check `app/api/models/route.ts`
- **Chat Integration**: Check `app/api/chat/route.ts`
- **Frontend**: Check `lib/store.ts` and `components/chat/chat-interface.tsx`
