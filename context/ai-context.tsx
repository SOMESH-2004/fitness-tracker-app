'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Alert, analyzeProgressTrends, analyzeWorkoutConsistency, analyzeEatingPatterns, compareToGoals } from '@/lib/ai-analysis'

interface AIContextType {
  alerts: Alert[]
  isAnalyzing: boolean
  currentSuggestion: string
  analyzeProgress: (userData: any) => Promise<void>
  generateSuggestion: (userProgress: any, alerts: Alert[]) => Promise<void>
  clearAlerts: () => void
}

const AIContext = createContext<AIContextType | undefined>(undefined)

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentSuggestion, setCurrentSuggestion] = useState('')

  const analyzeProgress = useCallback(async (userData: any) => {
    setIsAnalyzing(true)
    const newAlerts: Alert[] = []

    try {
      // Analyze progress trends
      if (userData.weightEntries && userData.weightEntries.length > 0) {
        const trendAnalysis = analyzeProgressTrends(userData.weightEntries)
        newAlerts.push(...trendAnalysis.alerts)
      }

      // Analyze workout consistency
      if (userData.workouts) {
        const workoutAnalysis = analyzeWorkoutConsistency(userData.workouts)
        newAlerts.push(...workoutAnalysis.alerts)
      }

      // Analyze eating patterns
      if (userData.meals && userData.meals.length > 0) {
        const eatingAnalysis = analyzeEatingPatterns(userData.meals)
        newAlerts.push(...eatingAnalysis.alerts)
      }

      // Compare to goals
      if (userData.currentWeight && userData.goalWeight) {
        const goalAnalysis = compareToGoals(
          userData.currentWeight,
          userData.goalWeight,
          userData.caloriestoday || 0,
          userData.dailyCalorieGoal
        )
        newAlerts.push(...goalAnalysis.alerts)
      }

      // Remove duplicates and limit to 5 most recent/important alerts
      const uniqueAlerts = Array.from(new Map(newAlerts.map((a) => [a.message, a])).values())
        .sort((a, b) => {
          const severityScore = { high: 3, medium: 2, low: 1 }
          return severityScore[b.severity as keyof typeof severityScore] - severityScore[a.severity as keyof typeof severityScore]
        })
        .slice(0, 5)

      setAlerts(uniqueAlerts)
    } catch (error) {
      console.error('Error analyzing progress:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  const generateSuggestion = useCallback(async (userProgress: any, currentAlerts: Alert[]) => {
    try {
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProgress,
          alerts: currentAlerts,
        }),
      })

      if (!response.ok) throw new Error('Failed to generate suggestion')

      const reader = response.body?.getReader()
      if (!reader) return

      let suggestion = ''
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        suggestion += decoder.decode(value, { stream: true })
        setCurrentSuggestion(suggestion)
      }
    } catch (error) {
      console.error('Error generating suggestion:', error)
      setCurrentSuggestion('Unable to generate suggestion at this time.')
    }
  }, [])

  const clearAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  return (
    <AIContext.Provider value={{ alerts, isAnalyzing, currentSuggestion, analyzeProgress, generateSuggestion, clearAlerts }}>
      {children}
    </AIContext.Provider>
  )
}

export function useAI() {
  const context = useContext(AIContext)
  if (!context) {
    throw new Error('useAI must be used within AIProvider')
  }
  return context
}
