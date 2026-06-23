'use server'

import { streamTextWithFallback, getAPIStatus } from '@/lib/ai-request'

export async function POST(req: Request) {
  try {
    const { userProgress, alerts } = await req.json()

    const systemPrompt = `You are Fit Guru, an AI fitness coach providing real-time suggestions. Based on the user's progress and alerts, provide:
1. Immediate actionable suggestions
2. Motivation and encouragement
3. Specific recommendations for diet or workout adjustments
4. Warning alerts if needed

Be concise, friendly, and focused on helping the user achieve their goals.`

    const alertsContext = alerts
      .map((alert: any) => `- ${alert.type}: ${alert.message}`)
      .join('\n')

    const userPrompt = `Real-time alerts and progress:
${alertsContext}

Current progress:
- Weight: ${userProgress.currentWeight}kg
- Goal: ${userProgress.goalWeight}kg
- Calories today: ${userProgress.caloriestoday}/${userProgress.dailyGoal}
- Workouts this week: ${userProgress.weeklyWorkouts}

Provide specific, actionable suggestions to help them stay on track.`

    const result = await streamTextWithFallback({
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.8,
      maxTokens: 300,
      model: 'gpt-4-turbo',
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('[Suggestions API] Error:', error)
    const status = getAPIStatus()
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate suggestions',
        apiStatus: status
      },
      { status: 500 }
    )
  }
}
