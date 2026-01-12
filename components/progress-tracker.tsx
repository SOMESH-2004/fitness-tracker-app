"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Plus, TrendingUp, TrendingDown, Scale, Target, Flame, Dumbbell } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface WeightEntry {
  date: string
  weight: number
}

interface DailyStats {
  date: string
  consumed: number
  burned: number
}

export function ProgressTracker() {
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([])
  const [newWeight, setNewWeight] = useState("")
  const [goalWeight, setGoalWeight] = useState(70)

  useEffect(() => {
    const savedWeight = localStorage.getItem("weightEntries")
    const savedGoal = localStorage.getItem("goalWeight")
    if (savedWeight) setWeightEntries(JSON.parse(savedWeight))
    if (savedGoal) setGoalWeight(Number.parseFloat(savedGoal))
  }, [])

  const addWeightEntry = () => {
    if (!newWeight) return
    const entry: WeightEntry = {
      date: new Date().toISOString().split("T")[0],
      weight: Number.parseFloat(newWeight),
    }
    const existing = weightEntries.filter((e) => e.date !== entry.date)
    const updated = [...existing, entry].sort((a, b) => a.date.localeCompare(b.date))
    setWeightEntries(updated)
    localStorage.setItem("weightEntries", JSON.stringify(updated))
    setNewWeight("")
  }

  const updateGoalWeight = (goal: number) => {
    setGoalWeight(goal)
    localStorage.setItem("goalWeight", goal.toString())
  }

  const getWeeklyStats = (): DailyStats[] => {
    const meals = JSON.parse(localStorage.getItem("meals") || "{}")
    const workouts = JSON.parse(localStorage.getItem("workouts") || "{}")
    const stats: DailyStats[] = []
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      const dayName = days[date.getDay()]

      const consumed = (meals[dateStr] || []).reduce(
        (sum: number, m: { calories: string }) => sum + (Number.parseInt(m.calories) || 0),
        0,
      )
      const burned = (workouts[dayName] || []).reduce(
        (sum: number, w: { calories: string }) => sum + (Number.parseInt(w.calories) || 0),
        0,
      )

      stats.push({
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        consumed,
        burned,
      })
    }

    return stats
  }

  const currentWeight = weightEntries[weightEntries.length - 1]?.weight || 0
  const startWeight = weightEntries[0]?.weight || currentWeight
  const weightChange = currentWeight - startWeight
  const progressToGoal =
    goalWeight !== startWeight
      ? Math.min(Math.abs((startWeight - currentWeight) / (startWeight - goalWeight)) * 100, 100)
      : 0

  const weeklyStats = getWeeklyStats()
  const totalConsumed = weeklyStats.reduce((sum, d) => sum + d.consumed, 0)
  const totalBurned = weeklyStats.reduce((sum, d) => sum + d.burned, 0)

  const chartData = weightEntries.slice(-14).map((e) => ({
    date: new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    weight: e.weight,
  }))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Scale className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Weight</p>
                <p className="text-xl font-bold text-foreground">{currentWeight > 0 ? `${currentWeight} kg` : "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                {weightChange <= 0 ? (
                  <TrendingDown className="h-5 w-5 text-accent-foreground" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-accent-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Change</p>
                <p className={`text-xl font-bold ${weightChange <= 0 ? "text-primary" : "text-destructive"}`}>
                  {weightChange !== 0 ? `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} kg` : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Flame className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weekly Consumed</p>
                <p className="text-xl font-bold text-foreground">{totalConsumed.toLocaleString()} kcal</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <Dumbbell className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weekly Burned</p>
                <p className="text-xl font-bold text-foreground">{totalBurned.toLocaleString()} kcal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border bg-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Target className="h-5 w-5 text-primary" />
              Weight Goal
            </CardTitle>
            <CardDescription className="text-muted-foreground">Track your progress towards your goal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Log Today&apos;s Weight</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.1"
                  placeholder="70.5"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="bg-background border-border text-foreground"
                />
                <Button onClick={addWeightEntry}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Goal Weight (kg)</Label>
              <Input
                type="number"
                step="0.1"
                value={goalWeight}
                onChange={(e) => updateGoalWeight(Number.parseFloat(e.target.value) || 70)}
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress to Goal</span>
                <span className="text-primary">{progressToGoal.toFixed(0)}%</span>
              </div>
              <Progress value={progressToGoal} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground">Weight History</CardTitle>
            <CardDescription className="text-muted-foreground">Your weight trend over time</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length < 2 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Scale className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">Log at least 2 weight entries to see the chart</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={["dataMin - 2", "dataMax + 2"]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Calories: Consumed vs Burned</CardTitle>
          <CardDescription className="text-muted-foreground">Last 7 days comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="consumed" name="Consumed" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="burned" name="Burned" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-chart-1" />
              <span className="text-sm text-muted-foreground">Consumed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-chart-2" />
              <span className="text-sm text-muted-foreground">Burned</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
