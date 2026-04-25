'use client'

import React, { useState, useEffect } from 'react'
import { useAI } from '@/context/ai-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Loader2, Zap, TrendingDown, Dumbbell, Apple } from 'lucide-react'

interface AISidebarProps {
  userStats: {
    currentWeight: number
    goalWeight: number
    dailyCalorieGoal: number
    caloriestoday: number
    weeklyWorkouts: number
    weightEntries: Array<{ date: string; weight: number }>
    workouts: Record<string, any[]>
    meals: Array<{ name: string; calories: number; type: string }>
  }
}

export function AISidebar({ userStats }: AISidebarProps) {
  const { alerts, isAnalyzing, currentSuggestion, analyzeProgress, generateSuggestion, clearAlerts } = useAI()
  const [activeTab, setActiveTab] = useState('suggestions')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState('')

  // Auto-analyze on component mount and when user stats change
  useEffect(() => {
    analyzeProgress(userStats)
  }, [userStats, analyzeProgress])

  // Generate initial suggestion
  useEffect(() => {
    if (alerts.length > 0) {
      setIsGenerating(true)
      generateSuggestion(userStats, alerts).finally(() => setIsGenerating(false))
    }
  }, [alerts, userStats, generateSuggestion])

  const handleAnalysis = async (type: string) => {
    setSelectedAnalysis(type)
    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisType: type,
          userData: {
            ...userStats,
            dailyCaloriesConsumed: userStats.caloriestoday,
          },
        }),
      })

      const data = await response.json()
      setAnalysisResult(data.analysis)
    } catch (error) {
      console.error('Analysis error:', error)
      setAnalysisResult('Failed to generate analysis. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200'
      case 'medium':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      default:
        return 'text-blue-600'
    }
  }

  return (
    <div className="w-full max-w-md bg-white border-l border-gray-200 rounded-lg shadow-lg overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
        <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-green-600" />
            <h2 className="font-bold text-lg text-gray-900">AI Coach</h2>
          </div>
          <TabsList className="w-full grid grid-cols-2 bg-white border border-gray-200">
            <TabsTrigger value="suggestions" className="text-xs">
              Suggestions
            </TabsTrigger>
            <TabsTrigger value="analysis" className="text-xs">
              Analysis
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="suggestions" className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Real-time Alerts */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Real-time Alerts
            </h3>
            {alerts.length === 0 ? (
              <p className="text-sm text-gray-500">No alerts at the moment. Keep up the great work!</p>
            ) : (
              <div className="space-y-2">
                {alerts.map((alert, idx) => (
                  <Card key={idx} className={`p-3 border text-sm ${getSeverityColor(alert.severity)}`}>
                    <div className="flex gap-2 items-start">
                      <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${getSeverityIcon(alert.severity)}`} />
                      <p className="text-gray-800">{alert.message}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* AI Suggestion */}
          <div className="space-y-2 border-t pt-4">
            <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-600" />
              Smart Suggestions
            </h3>
            {isGenerating ? (
              <div className="flex items-center justify-center p-4 bg-green-50 rounded border border-green-200">
                <Loader2 className="w-4 h-4 animate-spin text-green-600 mr-2" />
                <span className="text-sm text-green-700">Generating suggestions...</span>
              </div>
            ) : currentSuggestion ? (
              <Card className="p-3 bg-green-50 border border-green-200 text-sm text-gray-800 leading-relaxed">
                {currentSuggestion}
              </Card>
            ) : (
              <p className="text-sm text-gray-500">Complete your daily activities for personalized suggestions.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button
              size="sm"
              variant={selectedAnalysis === 'progress_trend' ? 'default' : 'outline'}
              onClick={() => handleAnalysis('progress_trend')}
              className="text-xs h-auto py-2"
            >
              <TrendingDown className="w-3 h-3 mr-1" />
              Progress
            </Button>
            <Button
              size="sm"
              variant={selectedAnalysis === 'workout_consistency' ? 'default' : 'outline'}
              onClick={() => handleAnalysis('workout_consistency')}
              className="text-xs h-auto py-2"
            >
              <Dumbbell className="w-3 h-3 mr-1" />
              Workouts
            </Button>
            <Button
              size="sm"
              variant={selectedAnalysis === 'eating_patterns' ? 'default' : 'outline'}
              onClick={() => handleAnalysis('eating_patterns')}
              className="text-xs h-auto py-2"
            >
              <Apple className="w-3 h-3 mr-1" />
              Diet
            </Button>
            <Button
              size="sm"
              variant={selectedAnalysis === 'goal_comparison' ? 'default' : 'outline'}
              onClick={() => handleAnalysis('goal_comparison')}
              className="text-xs h-auto py-2"
            >
              <Zap className="w-3 h-3 mr-1" />
              Goals
            </Button>
          </div>

          {isGenerating ? (
            <div className="flex items-center justify-center p-4 bg-gray-50 rounded border border-gray-200">
              <Loader2 className="w-4 h-4 animate-spin text-gray-600 mr-2" />
              <span className="text-sm text-gray-600">Analyzing...</span>
            </div>
          ) : analysisResult ? (
            <Card className="p-3 bg-gray-50 border border-gray-200 text-sm text-gray-800 leading-relaxed">
              {analysisResult}
            </Card>
          ) : (
            <p className="text-sm text-gray-500">Select an analysis type to get detailed insights.</p>
          )}
        </TabsContent>
      </Tabs>

      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
        <Button
          size="sm"
          variant="ghost"
          onClick={clearAlerts}
          className="w-full text-xs text-gray-600 hover:text-gray-900"
        >
          Clear Alerts
        </Button>
      </div>
    </div>
  )
}
