import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import Anthropic from "@anthropic-ai/sdk"

export const runtime = "edge"

interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

interface ChatRequest {
  messages: Message[]
  model: string
  provider: "openai" | "anthropic"
}

export async function POST(req: NextRequest) {
  try {
    const { messages, model, provider } = (await req.json()) as ChatRequest

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      )
    }

    // Create a readable stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          if (provider === "openai") {
            await streamOpenAI(messages, model, controller, encoder)
          } else if (provider === "anthropic") {
            await streamAnthropic(messages, model, controller, encoder)
          } else {
            throw new Error(`Unsupported provider: ${provider}`)
          }
        } catch (error: any) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: error.message })}\n\n`
            )
          )
        } finally {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error: any) {
    console.error("Error in chat route:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

async function streamOpenAI(
  messages: Message[],
  model: string,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OpenAI API key not configured")
  }

  const openai = new OpenAI({ apiKey })

  const stream = await openai.chat.completions.create({
    model,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    stream: true,
  })

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (content) {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
      )
    }
  }
}

async function streamAnthropic(
  messages: Message[],
  model: string,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error("Anthropic API key not configured")
  }

  const anthropic = new Anthropic({ apiKey })

  // Separate system messages from other messages
  const systemMessage = messages.find((m) => m.role === "system")?.content
  const conversationMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }))

  const stream = await anthropic.messages.stream({
    model,
    max_tokens: 4096,
    messages: conversationMessages,
    ...(systemMessage && { system: systemMessage }),
  })

  for await (const chunk of stream) {
    if (
      chunk.type === "content_block_delta" &&
      chunk.delta.type === "text_delta"
    ) {
      const content = chunk.delta.text
      if (content) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
        )
      }
    }
  }
}
