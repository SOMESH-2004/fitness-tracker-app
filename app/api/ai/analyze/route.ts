'use server'

import { generateTextWithFallback, getAPIStatus } from '@/lib/ai-request'

export async function POST(req: Request) {
  try {
    const { userData, analysisType } = await req.json()

    const systemPrompt = `You are Fit Guru, a professional fitness and nutrition coach. Analyze the user's fitness data and provide specific, actionable advice. Be encouraging but honest. Keep responses concise (2-3 paragraphs max).`

    let userPrompt = ''

    switch (analysisType) {
      case 'progress_trend':
        userPrompt = `Analyze this progress data and identify trends:
Weight entries: ${JSON.stringify(userData.weightEntries)}
Daily calories consumed: ${userData.dailyCaloriesConsumed}
Daily calories goal: ${userData.dailyCalorieGoal}
Goal weight: ${userData.goalWeight}

Provide insights on their weight loss/gain trend and whether they're on track to reach their goal.`
        break

      case 'workout_consistency':
        userPrompt = `Analyze this workout data:
Weekly workouts: ${JSON.stringify(userData.workouts)}
Total workouts this week: ${userData.weeklyWorkoutCount}
Average calories burned per workout: ${userData.avgCaloriesBurned}

Provide feedback on workout consistency and suggest improvements.`
        break

      case 'eating_patterns':
        userPrompt = `Analyze this meal data:
Meals logged today: ${JSON.stringify(userData.meals)}
Total calories today: ${userData.totalCaloriesToday}
Daily goal: ${userData.dailyCalorieGoal}
Meal distribution: ${JSON.stringify(userData.mealDistribution)}

Analyze eating patterns and suggest a more balanced diet approach.`
        break

      case 'goal_comparison':
        userPrompt = `Compare current progress to goals:
Current weight: ${userData.currentWeight}
Goal weight: ${userData.goalWeight}
Weight loss needed: ${userData.weightLossNeeded}
Progress made: ${userData.progressMade}
Time elapsed: ${userData.timeElapsed}
Estimated time to goal: ${userData.estimatedTimeToGoal}

Provide motivation and realistic feedback on goal achievement timeline.`
        break

      case 'personalized_plan':
        userPrompt = `Based on this user profile, create a personalized 7-day plan:
User stats: ${JSON.stringify(userData.userStats)}
Current weight: ${userData.currentWeight}
Goal weight: ${userData.goalWeight}
Daily calorie goal: ${userData.dailyCalorieGoal}
Activity level: ${userData.activityLevel}
Dietary preferences: ${userData.dietaryPreferences}

Suggest a balanced 7-day meal and workout plan with specific exercises and meals.`
        break

      default:
        userPrompt = `Provide general fitness advice based on this data: ${JSON.stringify(userData)}`
    }

    const response = await generateTextWithFallback({
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxTokens: 500,
      model: 'gpt-4-turbo',
    })

    return Response.json({
      success: true,
      analysis: response.text,
      type: analysisType,
    })
  } catch (error) {
    console.error('[Analyze API] Error:', error)
    const status = getAPIStatus()
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze data',
        apiStatus: status
      },
      { status: 500 }
    )
  }
}
