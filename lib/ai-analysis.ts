// Analyze user progress data and generate alerts
export interface UserProgress {
  currentWeight: number
  goalWeight: number
  dailyGoal: number
  caloriestoday: number
  weightEntries: Array<{ date: string; weight: number }>
  meals: Array<{ name: string; calories: number; type: string }>
  workouts: Record<string, any[]>
  weeklyWorkouts: number
}

export interface Alert {
  type: 'warning' | 'info' | 'success'
  message: string
  severity: 'low' | 'medium' | 'high'
  timestamp: string
}

export function analyzeProgressTrends(weightEntries: Array<{ date: string; weight: number }>): {
  trend: 'losing' | 'gaining' | 'stable'
  weeklyChange: number
  alerts: Alert[]
} {
  if (weightEntries.length < 2) {
    return { trend: 'stable', weeklyChange: 0, alerts: [] }
  }

  const alerts: Alert[] = []
  const sortedEntries = [...weightEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const lastEntry = sortedEntries[sortedEntries.length - 1]
  const weekAgoIndex = Math.max(0, sortedEntries.length - 8)
  const weekAgoEntry = sortedEntries[weekAgoIndex]

  const weeklyChange = lastEntry.weight - weekAgoEntry.weight

  let trend: 'losing' | 'gaining' | 'stable' = 'stable'
  if (weeklyChange < -0.5) trend = 'losing'
  if (weeklyChange > 0.5) trend = 'gaining'

  if (trend === 'gaining') {
    alerts.push({
      type: 'warning',
      message: 'Weight is increasing. Check your calorie intake.',
      severity: 'medium',
      timestamp: new Date().toISOString(),
    })
  }

  if (trend === 'losing') {
    alerts.push({
      type: 'success',
      message: 'Great progress! Keep up the momentum.',
      severity: 'low',
      timestamp: new Date().toISOString(),
    })
  }

  return { trend, weeklyChange, alerts }
}

export function analyzeWorkoutConsistency(workouts: Record<string, any[]>): {
  weeklyCount: number
  consistency: 'excellent' | 'good' | 'fair' | 'poor'
  alerts: Alert[]
} {
  const alerts: Alert[] = []
  const daysWithWorkouts = Object.values(workouts).filter((dayWorkouts) => dayWorkouts.length > 0).length
  const weeklyCount = daysWithWorkouts

  let consistency: 'excellent' | 'good' | 'fair' | 'poor' = 'poor'
  if (weeklyCount >= 5) consistency = 'excellent'
  if (weeklyCount >= 4) consistency = 'good'
  if (weeklyCount >= 2) consistency = 'fair'

  if (consistency === 'poor') {
    alerts.push({
      type: 'warning',
      message: 'Low workout frequency this week. Aim for at least 3-4 sessions.',
      severity: 'high',
      timestamp: new Date().toISOString(),
    })
  }

  if (consistency === 'excellent') {
    alerts.push({
      type: 'success',
      message: 'Excellent workout consistency! You&apos;re crushing your fitness goals.',
      severity: 'low',
      timestamp: new Date().toISOString(),
    })
  }

  return { weeklyCount, consistency, alerts }
}

export function analyzeEatingPatterns(meals: Array<{ name: string; calories: number; type: string }>): {
  totalCalories: number
  mealDistribution: Record<string, number>
  alerts: Alert[]
} {
  const alerts: Alert[] = []
  const mealDistribution: Record<string, number> = {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snacks: 0,
  }

  let totalCalories = 0
  meals.forEach((meal) => {
    totalCalories += meal.calories
    if (mealDistribution[meal.type] !== undefined) {
      mealDistribution[meal.type] += meal.calories
    }
  })

  // Check for imbalanced meals
  const mealCounts = Object.values(mealDistribution).filter((cal) => cal > 0)
  const avgMealCalories = totalCalories / (mealCounts.length || 1)

  Object.entries(mealDistribution).forEach(([type, calories]) => {
    if (calories > avgMealCalories * 1.5 && calories > 0) {
      alerts.push({
        type: 'info',
        message: `${type} is higher than average. Consider lighter portions.`,
        severity: 'low',
        timestamp: new Date().toISOString(),
      })
    }
  })

  return { totalCalories, mealDistribution, alerts }
}

export function compareToGoals(
  currentWeight: number,
  goalWeight: number,
  dailyCaloriesConsumed: number,
  dailyCalorieGoal: number
): {
  weightProgress: number
  calorieProgress: number
  alerts: Alert[]
} {
  const alerts: Alert[] = []

  const weightProgress = ((goalWeight - currentWeight) / (goalWeight - currentWeight)) * 100 || 0
  const calorieProgress = (dailyCaloriesConsumed / dailyCalorieGoal) * 100

  // Weight goal alert
  if (currentWeight <= goalWeight) {
    alerts.push({
      type: 'success',
      message: 'Goal weight reached! Maintain this with consistent healthy habits.',
      severity: 'low',
      timestamp: new Date().toISOString(),
    })
  }

  // Calorie alerts
  if (calorieProgress > 100) {
    alerts.push({
      type: 'warning',
      message: `You've exceeded your daily calorie goal by ${Math.round(calorieProgress - 100)}%.`,
      severity: 'medium',
      timestamp: new Date().toISOString(),
    })
  } else if (calorieProgress < 50) {
    alerts.push({
      type: 'info',
      message: 'You&apos;re significantly under your calorie goal. Make sure you&apos;re eating enough.',
      severity: 'low',
      timestamp: new Date().toISOString(),
    })
  }

  return { weightProgress, calorieProgress, alerts }
}

export async function fetchAIAnalysis(type: string, userData: any): Promise<string> {
  try {
    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userData,
        analysisType: type,
      }),
    })

    if (!response.ok) throw new Error('Failed to fetch analysis')
    const data = await response.json()
    return data.analysis
  } catch (error) {
    console.error('Error fetching AI analysis:', error)
    return 'Unable to generate analysis at this time.'
  }
}
