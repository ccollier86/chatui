import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { streamText, CoreMessage } from "ai"

export const runtime = "edge"

interface ChatRequest {
  messages: CoreMessage[]
  model: string
  provider: "openai" | "anthropic"
}

export async function POST(req: Request) {
  try {
    const { messages, model, provider } = (await req.json()) as ChatRequest

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Initialize the provider based on the selection
    let providerInstance
    let selectedModel

    if (provider === "openai") {
      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: "OpenAI API key not configured" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        )
      }
      const openai = createOpenAI({ apiKey })
      selectedModel = openai(model)
    } else if (provider === "anthropic") {
      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: "Anthropic API key not configured" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        )
      }
      const anthropic = createAnthropic({ apiKey })
      selectedModel = anthropic(model)
    } else {
      return new Response(
        JSON.stringify({ error: `Unsupported provider: ${provider}` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Use the AI SDK's streamText function
    const result = streamText({
      model: selectedModel,
      messages,
    })

    // Return the streaming response
    return result.toTextStreamResponse()
  } catch (error: any) {
    console.error("Error in chat route:", error)
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
