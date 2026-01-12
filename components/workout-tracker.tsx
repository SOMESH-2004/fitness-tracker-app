"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Dumbbell, Flame } from "lucide-react"

interface Workout {
  id: string
  name: string
  sets: string
  reps: string
  duration: string
  calories: string
}

interface DayWorkouts {
  [key: string]: Workout[]
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export function WorkoutTracker() {
  const [selectedDay, setSelectedDay] = useState("Monday")
  const [workouts, setWorkouts] = useState<DayWorkouts>({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  })
  const [newWorkout, setNewWorkout] = useState<Omit<Workout, "id">>({
    name: "",
    sets: "",
    reps: "",
    duration: "",
    calories: "",
  })

  useEffect(() => {
    const saved = localStorage.getItem("workouts")
    if (saved) {
      setWorkouts(JSON.parse(saved))
    }
  }, [])

  const saveWorkouts = (data: DayWorkouts) => {
    setWorkouts(data)
    localStorage.setItem("workouts", JSON.stringify(data))
  }

  const addWorkout = () => {
    if (!newWorkout.name) return
    const workout: Workout = {
      ...newWorkout,
      id: Date.now().toString(),
    }
    const updated = {
      ...workouts,
      [selectedDay]: [...workouts[selectedDay], workout],
    }
    saveWorkouts(updated)
    setNewWorkout({ name: "", sets: "", reps: "", duration: "", calories: "" })
  }

  const removeWorkout = (id: string) => {
    const updated = {
      ...workouts,
      [selectedDay]: workouts[selectedDay].filter((w) => w.id !== id),
    }
    saveWorkouts(updated)
  }

  const getTotalCalories = (day: string) => {
    return workouts[day].reduce((sum, w) => sum + (Number.parseInt(w.calories) || 0), 0)
  }

  const getWeeklyCalories = () => {
    return days.reduce((sum, day) => sum + getTotalCalories(day), 0)
  }

  const getWeeklyWorkouts = () => {
    return days.reduce((sum, day) => sum + workouts[day].length, 0)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Dumbbell className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weekly Workouts</p>
                <p className="text-xl font-bold text-foreground">{getWeeklyWorkouts()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <Flame className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weekly Calories Burned</p>
                <p className="text-xl font-bold text-foreground">{getWeeklyCalories().toLocaleString()} kcal</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Dumbbell className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{selectedDay} Workouts</p>
                <p className="text-xl font-bold text-foreground">{workouts[selectedDay].length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <Flame className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{selectedDay} Calories</p>
                <p className="text-xl font-bold text-foreground">
                  {getTotalCalories(selectedDay).toLocaleString()} kcal
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border bg-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-foreground">Add Workout</CardTitle>
            <CardDescription className="text-muted-foreground">Log a new exercise for the selected day</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Day</Label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Exercise Name</Label>
              <Input
                placeholder="e.g., Bench Press"
                value={newWorkout.name}
                onChange={(e) => setNewWorkout({ ...newWorkout, name: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Sets</Label>
                <Input
                  type="number"
                  placeholder="3"
                  value={newWorkout.sets}
                  onChange={(e) => setNewWorkout({ ...newWorkout, sets: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Reps</Label>
                <Input
                  type="number"
                  placeholder="10"
                  value={newWorkout.reps}
                  onChange={(e) => setNewWorkout({ ...newWorkout, reps: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Duration (min)</Label>
                <Input
                  type="number"
                  placeholder="30"
                  value={newWorkout.duration}
                  onChange={(e) => setNewWorkout({ ...newWorkout, duration: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Calories</Label>
                <Input
                  type="number"
                  placeholder="150"
                  value={newWorkout.calories}
                  onChange={(e) => setNewWorkout({ ...newWorkout, calories: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>
            <Button onClick={addWorkout} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Workout
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground">{selectedDay}&apos;s Workouts</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your exercise schedule for {selectedDay}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {workouts[selectedDay].length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Dumbbell className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No workouts logged for {selectedDay}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {workouts[selectedDay].map((workout) => (
                  <div
                    key={workout.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-background p-4"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{workout.name}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {workout.sets && workout.reps && (
                          <span>
                            {workout.sets} sets × {workout.reps} reps
                          </span>
                        )}
                        {workout.duration && <span>{workout.duration} min</span>}
                        {workout.calories && <span className="text-primary">{workout.calories} kcal</span>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeWorkout(workout.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
