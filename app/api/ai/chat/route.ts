import { streamTextWithFallback, getAPIStatus } from '@/lib/ai-request'

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
    const result = await streamTextWithFallback({
      system: `You are Fit Guru, an advanced AI Fitness Coach. You have access to the user's fitness data and can:
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
      model: 'gpt-4-turbo',
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
          console.error('[Chat Stream] Error:', error)
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
    console.error('[Chat API] Error:', error)
    const status = getAPIStatus()
    return Response.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process chat message',
        apiStatus: status
      },
      { status: 500 }
    )
  }
}
