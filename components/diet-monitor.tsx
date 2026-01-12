"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Plus, Trash2, Utensils, Coffee, Sun, Moon, Cookie } from "lucide-react"

interface Meal {
  id: string
  name: string
  calories: string
  type: string
}

interface DayMeals {
  [key: string]: Meal[]
}

const mealTypes = [
  { value: "breakfast", label: "Breakfast", icon: Coffee },
  { value: "lunch", label: "Lunch", icon: Sun },
  { value: "dinner", label: "Dinner", icon: Moon },
  { value: "snack", label: "Snack", icon: Cookie },
]

export function DietMonitor() {
  const [meals, setMeals] = useState<DayMeals>({})
  const [newMeal, setNewMeal] = useState({ name: "", calories: "", type: "breakfast" })
  const [dailyGoal, setDailyGoal] = useState(2000)

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    const savedMeals = localStorage.getItem("meals")
    const savedGoal = localStorage.getItem("dailyCalorieGoal")
    if (savedMeals) setMeals(JSON.parse(savedMeals))
    if (savedGoal) setDailyGoal(Number.parseInt(savedGoal))
  }, [])

  const saveMeals = (data: DayMeals) => {
    setMeals(data)
    localStorage.setItem("meals", JSON.stringify(data))
  }

  const addMeal = () => {
    if (!newMeal.name || !newMeal.calories) return
    const meal: Meal = {
      ...newMeal,
      id: Date.now().toString(),
    }
    const todayMeals = meals[today] || []
    const updated = {
      ...meals,
      [today]: [...todayMeals, meal],
    }
    saveMeals(updated)
    setNewMeal({ name: "", calories: "", type: "breakfast" })
  }

  const removeMeal = (id: string) => {
    const updated = {
      ...meals,
      [today]: (meals[today] || []).filter((m) => m.id !== id),
    }
    saveMeals(updated)
  }

  const updateGoal = (goal: number) => {
    setDailyGoal(goal)
    localStorage.setItem("dailyCalorieGoal", goal.toString())
  }

  const getTodayCalories = () => {
    return (meals[today] || []).reduce((sum, m) => sum + (Number.parseInt(m.calories) || 0), 0)
  }

  const getCaloriesByType = (type: string) => {
    return (meals[today] || [])
      .filter((m) => m.type === type)
      .reduce((sum, m) => sum + (Number.parseInt(m.calories) || 0), 0)
  }

  const todayCalories = getTodayCalories()
  const progress = Math.min((todayCalories / dailyGoal) * 100, 100)
  const remaining = Math.max(dailyGoal - todayCalories, 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mealTypes.map((type) => {
          const Icon = type.icon
          return (
            <Card key={type.value} className="border-border bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                    <Icon className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{type.label}</p>
                    <p className="text-xl font-bold text-foreground">
                      {getCaloriesByType(type.value).toLocaleString()} kcal
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Daily Progress</CardTitle>
          <CardDescription className="text-muted-foreground">
            {todayCalories.toLocaleString()} of {dailyGoal.toLocaleString()} kcal consumed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progress} className="h-4" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {remaining > 0 ? `${remaining.toLocaleString()} kcal remaining` : "Daily goal reached!"}
            </span>
            <span className={todayCalories > dailyGoal ? "text-destructive" : "text-primary"}>
              {progress.toFixed(0)}%
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="goal" className="text-foreground whitespace-nowrap">
              Daily Goal:
            </Label>
            <Input
              id="goal"
              type="number"
              value={dailyGoal}
              onChange={(e) => updateGoal(Number.parseInt(e.target.value) || 2000)}
              className="w-32 bg-background border-border text-foreground"
            />
            <span className="text-muted-foreground">kcal</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border bg-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-foreground">Log Meal</CardTitle>
            <CardDescription className="text-muted-foreground">Add food items to your daily log</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Meal Type</Label>
              <Select value={newMeal.type} onValueChange={(v) => setNewMeal({ ...newMeal, type: v })}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mealTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Food Name</Label>
              <Input
                placeholder="e.g., Grilled Chicken Salad"
                value={newMeal.name}
                onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Calories</Label>
              <Input
                type="number"
                placeholder="350"
                value={newMeal.calories}
                onChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>
            <Button onClick={addMeal} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Log Meal
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground">Today&apos;s Meals</CardTitle>
            <CardDescription className="text-muted-foreground">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(meals[today] || []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Utensils className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No meals logged today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(meals[today] || []).map((meal) => {
                  const typeInfo = mealTypes.find((t) => t.value === meal.type)
                  const Icon = typeInfo?.icon || Utensils
                  return (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-background p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                          <Icon className="h-4 w-4 text-accent-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{meal.name}</p>
                          <p className="text-sm text-muted-foreground">{typeInfo?.label}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-primary">{meal.calories} kcal</span>
                        <Button variant="ghost" size="icon" onClick={() => removeMeal(meal.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
