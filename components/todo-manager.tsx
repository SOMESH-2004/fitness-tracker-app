'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  getTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
  getCategories,
  DEFAULT_CATEGORIES,
  getActiveTodos,
  getCompletedTodos,
  getOverdueTodos,
  type Todo,
} from '@/lib/todo-utils'
import { Trash2, Plus, Check, AlertCircle } from 'lucide-react'

interface TodoManagerProps {
  onUpdate?: () => void
}

export function TodoManager({ onUpdate }: TodoManagerProps) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [newCategory, setNewCategory] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [activeTab, setActiveTab] = useState('active')
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)

  useEffect(() => {
    const loadedTodos = getTodos()
    const loadedCategories = getCategories()
    setTodos(loadedTodos)
    setCategories(loadedCategories)
  }, [])

  const handleAddTodo = () => {
    if (!newTitle.trim()) return

    addTodo(newTitle, {
      description: newDescription,
      priority: newPriority,
      category: newCategory || undefined,
      dueDate: newDueDate || undefined,
    })

    setNewTitle('')
    setNewDescription('')
    setNewPriority('medium')
    setNewCategory('')
    setNewDueDate('')

    const updated = getTodos()
    setTodos(updated)
    onUpdate?.()
  }

  const handleToggle = (id: string) => {
    toggleTodo(id)
    const updated = getTodos()
    setTodos(updated)
    onUpdate?.()
  }

  const handleDelete = (id: string) => {
    deleteTodo(id)
    const updated = getTodos()
    setTodos(updated)
    onUpdate?.()
  }

  const activeTodos = getActiveTodos()
  const completedTodos = getCompletedTodos()
  const overdueTodos = getOverdueTodos()

  const renderTodoCard = (todo: Todo) => (
    <div
      key={todo.id}
      className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
        todo.completed
          ? 'bg-gray-50 border-gray-200'
          : 'bg-blue-50 border-blue-200'
      }`}
    >
      <button
        onClick={() => handleToggle(todo.id)}
        className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
          todo.completed
            ? 'bg-blue-600 border-blue-600'
            : 'border-blue-300 hover:border-blue-500'
        }`}
      >
        {todo.completed && <Check className="w-4 h-4 text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p
              className={`font-medium ${
                todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
              }`}
            >
              {todo.title}
            </p>
            {todo.description && (
              <p className="text-sm text-gray-600 mt-1">{todo.description}</p>
            )}
          </div>
          <button
            onClick={() => handleDelete(todo.id)}
            className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          {todo.category && (
            <span
              className="text-xs px-2 py-1 rounded-full text-white"
              style={{ backgroundColor: categories.find(c => c.name === todo.category)?.color }}
            >
              {todo.category}
            </span>
          )}
          <span
            className={`text-xs font-semibold px-2 py-1 rounded ${
              todo.priority === 'high'
                ? 'bg-red-100 text-red-700'
                : todo.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700'
            }`}
          >
            {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
          </span>
          {todo.dueDate && (
            <span className="text-xs text-gray-600">Due: {new Date(todo.dueDate).toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Todo</CardTitle>
          <CardDescription>Create a new task for your fitness journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="todo-title">Title *</Label>
            <Input
              id="todo-title"
              placeholder="Enter task title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="todo-description">Description</Label>
            <Input
              id="todo-description"
              placeholder="Add more details..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="todo-priority">Priority</Label>
              <Select value={newPriority} onValueChange={(v: any) => setNewPriority(v)}>
                <SelectTrigger id="todo-priority" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="todo-category">Category</Label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger id="todo-category" className="mt-1">
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="todo-date">Due Date</Label>
            <Input
              id="todo-date"
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="mt-1"
            />
          </div>

          <Button
            onClick={handleAddTodo}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Todo
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
          <CardDescription>
            {activeTodos.length} active, {completedTodos.length} completed
            {overdueTodos.length > 0 && `, ${overdueTodos.length} overdue`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">
                Active ({activeTodos.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedTodos.length})
              </TabsTrigger>
              {overdueTodos.length > 0 && (
                <TabsTrigger value="overdue">
                  Overdue ({overdueTodos.length})
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="active" className="space-y-3 mt-4">
              {activeTodos.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No active tasks. Great job!</p>
              ) : (
                activeTodos.map(renderTodoCard)
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-3 mt-4">
              {completedTodos.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No completed tasks yet</p>
              ) : (
                completedTodos.map(renderTodoCard)
              )}
            </TabsContent>

            {overdueTodos.length > 0 && (
              <TabsContent value="overdue" className="space-y-3 mt-4">
                {overdueTodos.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No overdue tasks</p>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg mb-4">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                    <p className="text-sm text-orange-800">
                      You have {overdueTodos.length} overdue task{overdueTodos.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
                {overdueTodos.map(renderTodoCard)}
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
