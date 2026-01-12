"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalorieCalculator } from "@/components/calorie-calculator"
import { WorkoutTracker } from "@/components/workout-tracker"
import { DietMonitor } from "@/components/diet-monitor"
import { ProgressTracker } from "@/components/progress-tracker"
import { Flame, Dumbbell, Utensils, TrendingUp } from "lucide-react"

export function FitnessTracker() {
  const [activeTab, setActiveTab] = useState("calculator")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Flame className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">FitTrack</h1>
              <p className="text-sm text-muted-foreground">Your Personal Fitness Companion</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-2 bg-transparent p-0">
            <TabsTrigger
              value="calculator"
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Flame className="h-4 w-4" />
              <span className="hidden sm:inline">Calorie Calculator</span>
              <span className="sm:hidden">Calories</span>
            </TabsTrigger>
            <TabsTrigger
              value="workouts"
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Dumbbell className="h-4 w-4" />
              <span className="hidden sm:inline">Workout Tracker</span>
              <span className="sm:hidden">Workouts</span>
            </TabsTrigger>
            <TabsTrigger
              value="diet"
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Utensils className="h-4 w-4" />
              <span className="hidden sm:inline">Diet Monitor</span>
              <span className="sm:hidden">Diet</span>
            </TabsTrigger>
            <TabsTrigger
              value="progress"
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Progress Tracking</span>
              <span className="sm:hidden">Progress</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="mt-6">
            <CalorieCalculator />
          </TabsContent>
          <TabsContent value="workouts" className="mt-6">
            <WorkoutTracker />
          </TabsContent>
          <TabsContent value="diet" className="mt-6">
            <DietMonitor />
          </TabsContent>
          <TabsContent value="progress" className="mt-6">
            <ProgressTracker />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
