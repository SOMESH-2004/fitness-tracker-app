"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Flame, Target, Activity } from "lucide-react"

interface CalorieData {
  age: string
  gender: string
  height: string
  weight: string
  activityLevel: string
  bmr: number
  tdee: number
}

const activityLevels = [
  { value: "sedentary", label: "Sedentary (little or no exercise)", multiplier: 1.2 },
  { value: "light", label: "Lightly active (1-3 days/week)", multiplier: 1.375 },
  { value: "moderate", label: "Moderately active (3-5 days/week)", multiplier: 1.55 },
  { value: "active", label: "Very active (6-7 days/week)", multiplier: 1.725 },
  { value: "extreme", label: "Extra active (very hard exercise)", multiplier: 1.9 },
]

export function CalorieCalculator() {
  const [formData, setFormData] = useState<CalorieData>({
    age: "",
    gender: "male",
    height: "",
    weight: "",
    activityLevel: "moderate",
    bmr: 0,
    tdee: 0,
  })

  useEffect(() => {
    const saved = localStorage.getItem("calorieData")
    if (saved) {
      setFormData(JSON.parse(saved))
    }
  }, [])

  const calculateCalories = () => {
    const age = Number.parseInt(formData.age)
    const height = Number.parseFloat(formData.height)
    const weight = Number.parseFloat(formData.weight)

    if (!age || !height || !weight) return

    let bmr: number
    if (formData.gender === "male") {
      bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
    } else {
      bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age
    }

    const activity = activityLevels.find((a) => a.value === formData.activityLevel)
    const tdee = bmr * (activity?.multiplier || 1.55)

    const newData = { ...formData, bmr: Math.round(bmr), tdee: Math.round(tdee) }
    setFormData(newData)
    localStorage.setItem("calorieData", JSON.stringify(newData))
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Calculator className="h-5 w-5 text-primary" />
            Calculate Your Daily Calories
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your details to calculate your daily calorie needs using the Mifflin-St Jeor formula
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age" className="text-foreground">
                Age
              </Label>
              <Input
                id="age"
                type="number"
                placeholder="25"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-foreground">
                Gender
              </Label>
              <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height" className="text-foreground">
                Height (cm)
              </Label>
              <Input
                id="height"
                type="number"
                placeholder="175"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-foreground">
                Weight (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                placeholder="70"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity" className="text-foreground">
              Activity Level
            </Label>
            <Select
              value={formData.activityLevel}
              onValueChange={(v) => setFormData({ ...formData, activityLevel: v })}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activityLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={calculateCalories} className="w-full">
            <Calculator className="mr-2 h-4 w-4" />
            Calculate Calories
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                <Flame className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Basal Metabolic Rate (BMR)</p>
                <p className="text-2xl font-bold text-foreground">
                  {formData.bmr > 0 ? `${formData.bmr.toLocaleString()} kcal/day` : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <Target className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Daily Energy Expenditure (TDEE)</p>
                <p className="text-2xl font-bold text-foreground">
                  {formData.tdee > 0 ? `${formData.tdee.toLocaleString()} kcal/day` : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                <Activity className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recommended for Weight Loss</p>
                <p className="text-2xl font-bold text-foreground">
                  {formData.tdee > 0 ? `${(formData.tdee - 500).toLocaleString()} kcal/day` : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
