'use client'

import { useState, useCallback, useEffect } from 'react'

export interface UserStats {
  currentWeight: number
  goalWeight: number
  dailyCalorieGoal: number
  caloriestoday: number
  weeklyWorkouts: number
  weightEntries: Array<{ date: string; weight: number }>
  workouts: Record<string, any[]>
  meals: Array<{ name: string; calories: number; type: string }>
}

const defaultStats: UserStats = {
  currentWeight: 0,
  goalWeight: 0,
  dailyCalorieGoal: 2000,
  caloriestoday: 0,
  weeklyWorkouts: 0,
  weightEntries: [],
  workouts: {},
  meals: [],
}

export function useUserStats() {
  const [userStats, setUserStats] = useState<UserStats>(defaultStats)

  const collectStats = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      const weightEntries = JSON.parse(localStorage.getItem('weightEntries') || '[]')
      const workouts = JSON.parse(localStorage.getItem('workouts') || '{}')
      const meals = JSON.parse(localStorage.getItem('meals') || '[]')
      const dailyCalorieGoal = JSON.parse(localStorage.getItem('dailyCalorieGoal') || '2000')
      const goalWeight = JSON.parse(localStorage.getItem('goalWeight') || '0')

      const currentWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : 0
      const totalCaloriesToday = meals.reduce((sum: number, meal: any) => sum + (meal.calories || 0), 0)
      
      // Count workouts from current week (Sunday-Saturday)
      const today = new Date()
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())
      
      let weeklyWorkoutCount = 0
      Object.entries(workouts).forEach(([day, dayWorkouts]: [string, any]) => {
        if (Array.isArray(dayWorkouts) && dayWorkouts.length > 0) {
          weeklyWorkoutCount++
        }
      })

      setUserStats({
        currentWeight,
        goalWeight,
        dailyCalorieGoal,
        caloriestoday: totalCaloriesToday,
        weeklyWorkouts: weeklyWorkoutCount,
        weightEntries,
        workouts,
        meals,
      })
    } catch (error) {
      console.error('Error collecting user stats:', error)
      setUserStats(defaultStats)
    }
  }, [])

  // Initial load
  useEffect(() => {
    collectStats()
  }, [collectStats])

  return { userStats, collectStats }
}
