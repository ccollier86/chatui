/**
 * Models API Endpoint
 *
 * Returns a combined list of available models from:
 * 1. Hardcoded AVAILABLE_MODELS (OpenAI, Anthropic direct connections)
 * 2. Dynamic models from LiteLLM proxy (if configured)
 *
 * This allows the frontend to dynamically discover all available models
 * without hardcoding them.
 *
 * Endpoint: GET /api/models
 * Response: Model[]
 */

import { NextResponse } from "next/server"
import { AVAILABLE_MODELS } from "@/types"
import { litellmAdapter } from "@/lib/adapters/litellm-adapter"

export const runtime = "edge"

// Cache control: cache for 5 minutes
const CACHE_DURATION = 300 // seconds

export async function GET() {
  try {
    let allModels = [...AVAILABLE_MODELS]

    // Add LiteLLM models if configured
    if (litellmAdapter.isConfigured()) {
      try {
        const litellmModels = await litellmAdapter.fetchModels()

        if (litellmModels.length > 0) {
          console.log(`Adding ${litellmModels.length} models from LiteLLM`)
          allModels = [...allModels, ...litellmModels]
        } else {
          console.warn("LiteLLM is configured but returned no models")
        }
      } catch (error) {
        console.error("Failed to fetch LiteLLM models:", error)
        // Continue with hardcoded models only
      }
    } else {
      console.log("LiteLLM is not configured, using hardcoded models only")
    }

    // Remove duplicates (in case a model exists in both lists)
    const uniqueModels = Array.from(
      new Map(allModels.map((model) => [model.id, model])).values()
    )

    // Sort models by provider, then by name
    uniqueModels.sort((a, b) => {
      if (a.provider !== b.provider) {
        return a.provider.localeCompare(b.provider)
      }
      return a.name.localeCompare(b.name)
    })

    console.log(
      `Returning ${uniqueModels.length} total models (${AVAILABLE_MODELS.length} hardcoded + ${uniqueModels.length - AVAILABLE_MODELS.length} from LiteLLM)`
    )

    return NextResponse.json(uniqueModels, {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate`,
      },
    })
  } catch (error: any) {
    console.error("Error in models route:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch models" },
      { status: 500 }
    )
  }
}

/**
 * Optional: POST endpoint to manually refresh the model cache
 * This can be useful for admin interfaces
 */
export async function POST() {
  try {
    if (!litellmAdapter.isConfigured()) {
      return NextResponse.json(
        { error: "LiteLLM is not configured" },
        { status: 400 }
      )
    }

    // Clear cache to force refresh
    litellmAdapter.clearCache()

    // Fetch fresh models
    const litellmModels = await litellmAdapter.fetchModels()

    return NextResponse.json({
      success: true,
      message: "Model cache refreshed",
      count: litellmModels.length,
    })
  } catch (error: any) {
    console.error("Error refreshing model cache:", error)
    return NextResponse.json(
      { error: error.message || "Failed to refresh model cache" },
      { status: 500 }
    )
  }
}
