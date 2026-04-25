import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(req: Request) {
  const { messages, userMessage } = await req.json()

  // Prepare messages for the AI
  const allMessages = [
    ...messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    })),
    {
      role: 'user',
      content: userMessage,
    },
  ]

  try {
    const result = streamText({
      model: openai('gpt-4-turbo'),
      system: `You are an advanced AI Fitness Coach. You have access to the user's fitness data and can:
1. Provide personalized workout recommendations based on their current routine
2. Give meal planning advice based on their diet history
3. Analyze their progress and suggest improvements
4. Create customized fitness plans
5. Offer motivation and guidance

When the user asks for specific changes to their fitness plan, workouts, or diet, you can suggest modifications. 
Be encouraging, data-driven, and always consider the user's current fitness level and goals.
Keep responses concise but helpful.`,
      messages: allMessages,
      maxTokens: 1024,
    })

    // Convert to SSE stream
    const encoder = new TextEncoder()
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            const sseChunk = `data: ${JSON.stringify({ delta: chunk })}\n\n`
            controller.enqueue(encoder.encode(sseChunk))
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } catch (error) {
          controller.error(error)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(customStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('AI chat error:', error)
    return Response.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
