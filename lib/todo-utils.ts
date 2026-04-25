export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  category?: string
  createdAt: string
  updatedAt: string
}

export interface TodoCategory {
  name: string
  color: string
}

const STORAGE_KEY = 'fitness-todos'
const CATEGORIES_KEY = 'fitness-todo-categories'

export const DEFAULT_CATEGORIES: TodoCategory[] = [
  { name: 'Fitness Goal', color: '#3b82f6' },
  { name: 'Diet Plan', color: '#8b5cf6' },
  { name: 'Workout', color: '#ec4899' },
  { name: 'Health', color: '#10b981' },
  { name: 'Personal', color: '#f59e0b' },
]

export function getTodos(): Todo[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

export function getCategories(): TodoCategory[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES
  const data = localStorage.getItem(CATEGORIES_KEY)
  return data ? JSON.parse(data) : DEFAULT_CATEGORIES
}

export function saveTodos(todos: Todo[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

export function saveCategories(categories: TodoCategory[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
}

export function addTodo(title: string, options?: Partial<Todo>): Todo {
  const todos = getTodos()
  const newTodo: Todo = {
    id: Date.now().toString(),
    title,
    completed: false,
    priority: options?.priority || 'medium',
    category: options?.category,
    description: options?.description,
    dueDate: options?.dueDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  todos.push(newTodo)
  saveTodos(todos)
  return newTodo
}

export function updateTodo(id: string, updates: Partial<Todo>): Todo | null {
  const todos = getTodos()
  const index = todos.findIndex(t => t.id === id)
  if (index === -1) return null
  
  todos[index] = {
    ...todos[index],
    ...updates,
    id: todos[index].id,
    createdAt: todos[index].createdAt,
    updatedAt: new Date().toISOString(),
  }
  saveTodos(todos)
  return todos[index]
}

export function deleteTodo(id: string): boolean {
  const todos = getTodos()
  const filtered = todos.filter(t => t.id !== id)
  if (filtered.length === todos.length) return false
  saveTodos(filtered)
  return true
}

export function toggleTodo(id: string): Todo | null {
  const todos = getTodos()
  const todo = todos.find(t => t.id === id)
  if (!todo) return null
  return updateTodo(id, { completed: !todo.completed })
}

export function getTodosByCategory(category: string): Todo[] {
  return getTodos().filter(t => t.category === category)
}

export function getTodosByPriority(priority: 'low' | 'medium' | 'high'): Todo[] {
  return getTodos().filter(t => t.priority === priority && !t.completed)
}

export function getCompletedTodos(): Todo[] {
  return getTodos().filter(t => t.completed)
}

export function getActiveTodos(): Todo[] {
  return getTodos().filter(t => !t.completed)
}

export function getTodaysTodos(): Todo[] {
  const today = new Date().toISOString().split('T')[0]
  return getTodos().filter(t => !t.completed && t.dueDate === today)
}

export function getOverdueTodos(): Todo[] {
  const today = new Date().toISOString().split('T')[0]
  return getTodos().filter(t => !t.completed && t.dueDate && t.dueDate < today)
}
