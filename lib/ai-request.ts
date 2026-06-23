// AI Request wrapper with multi-provider fallback support
import { streamText, generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'

interface AIRequestOptions {
  messages?: Array<{ role: string; content: string }>
  prompt?: string
  system?: string
  maxTokens?: number
  temperature?: number
  timeout?: number
  model?: string
}

interface APIKey {
  provider: 'openai' | 'anthropic' | 'google'
  key: string
  isHealthy: boolean
  failureCount: number
}

class APIKeyProvider {
  private keys: APIKey[] = []
  private currentIndex = 0

  constructor() {
    this.initializeKeys()
  }

  private initializeKeys() {
    // Load from comma-separated environment variables
    const openaiKeys = process.env.OPENAI_API_KEYS?.split(',').filter(Boolean) || []
    const anthropicKeys = process.env.ANTHROPIC_API_KEYS?.split(',').filter(Boolean) || []
    const googleKeys = process.env.GOOGLE_API_KEYS?.split(',').filter(Boolean) || []

    // Add single keys for backward compatibility
    if (process.env.OPENAI_API_KEY && !openaiKeys.includes(process.env.OPENAI_API_KEY)) {
      openaiKeys.unshift(process.env.OPENAI_API_KEY)
    }
    if (process.env.ANTHROPIC_API_KEY && !anthropicKeys.includes(process.env.ANTHROPIC_API_KEY)) {
      anthropicKeys.unshift(process.env.ANTHROPIC_API_KEY)
    }
    if (process.env.GOOGLE_API_KEY && !googleKeys.includes(process.env.GOOGLE_API_KEY)) {
      googleKeys.unshift(process.env.GOOGLE_API_KEY)
    }

    // Build keys array with priority: OpenAI > Anthropic > Google
    this.keys = [
      ...openaiKeys.map(k => ({ provider: 'openai' as const, key: k.trim(), isHealthy: true, failureCount: 0 })),
      ...anthropicKeys.map(k => ({ provider: 'anthropic' as const, key: k.trim(), isHealthy: true, failureCount: 0 })),
      ...googleKeys.map(k => ({ provider: 'google' as const, key: k.trim(), isHealthy: true, failureCount: 0 })),
    ]

    console.log(`[API Provider] Loaded ${this.keys.length} API keys`)
  }

  getNextHealthyKey(): APIKey | null {
    // Find a healthy key
    const healthyKey = this.keys.find(k => k.isHealthy)
    if (healthyKey) {
      return healthyKey
    }

    // Reset all keys if none are healthy
    this.keys.forEach(k => {
      k.isHealthy = true
      k.failureCount = 0
    })

    return this.keys[0] || null
  }

  markSuccess() {
    if (this.keys[this.currentIndex]) {
      this.keys[this.currentIndex].failureCount = 0
    }
  }

  markFailure() {
    if (this.keys[this.currentIndex]) {
      this.keys[this.currentIndex].failureCount++
      if (this.keys[this.currentIndex].failureCount >= 3) {
        this.keys[this.currentIndex].isHealthy = false
        console.log(`[API Provider] Marked ${this.keys[this.currentIndex].provider} key as unhealthy`)
      }
    }
  }

  getStatus() {
    return this.keys.map((k, i) => ({
      index: i,
      provider: k.provider,
      isHealthy: k.isHealthy,
      failureCount: k.failureCount,
    }))
  }
}

const apiProvider = new APIKeyProvider()

/**
 * Get model instance with current API key
 */
function getModelInstance(modelName: string) {
  const key = apiProvider.getNextHealthyKey()

  if (!key) {
    console.warn('[Model Init] No API keys available - using OpenAI with environment key')
    // Fallback to environment variable (Vercel AI Gateway or OPENAI_API_KEY)
    try {
      return openai(modelName)
    } catch (error) {
      console.error('[Model Init] Error initializing with environment key:', error)
      throw new Error(
        'No API keys available. Please set OPENAI_API_KEY environment variable or provide API keys via: OPENAI_API_KEYS, ANTHROPIC_API_KEYS, GOOGLE_API_KEYS'
      )
    }
  }

  try {
    switch (key.provider) {
      case 'openai':
        return openai(modelName, { apiKey: key.key })
      case 'anthropic':
        return anthropic(modelName, { apiKey: key.key })
      case 'google':
        return google(modelName, { apiKey: key.key })
      default:
        throw new Error(`Unknown provider: ${key.provider}`)
    }
  } catch (error) {
    console.error(`[Model Init] Error with ${key.provider}:`, error)
    apiProvider.markFailure()
    throw error
  }
}

/**
 * Stream text with automatic fallback to next provider on failure
 */
export async function streamTextWithFallback(options: AIRequestOptions) {
  let lastError: Error | null = null
  const maxAttempts = 3

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const model = getModelInstance(options.model || 'gpt-4-turbo')
      console.log(`[Stream] Attempt ${attempt + 1}/${maxAttempts}`)

      const result = streamText({
        model,
        system: options.system,
        messages: options.messages,
        prompt: options.prompt,
        maxTokens: options.maxTokens || 1024,
        temperature: options.temperature || 0.7,
      })

      apiProvider.markSuccess()
      return result
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`[Stream] Attempt ${attempt + 1} failed:`, lastError.message)
      apiProvider.markFailure()

      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
      }
    }
  }

  throw lastError || new Error('Failed to stream text after multiple attempts')
}

/**
 * Generate text with automatic fallback to next provider on failure
 */
export async function generateTextWithFallback(options: AIRequestOptions) {
  let lastError: Error | null = null
  const maxAttempts = 3

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const model = getModelInstance(options.model || 'gpt-4-turbo')
      console.log(`[Generate] Attempt ${attempt + 1}/${maxAttempts}`)

      const result = generateText({
        model,
        system: options.system,
        messages: options.messages,
        prompt: options.prompt,
        maxTokens: options.maxTokens || 1024,
        temperature: options.temperature || 0.7,
      })

      apiProvider.markSuccess()
      return result
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`[Generate] Attempt ${attempt + 1} failed:`, lastError.message)
      apiProvider.markFailure()

      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
      }
    }
  }

  throw lastError || new Error('Failed to generate text after multiple attempts')
}

/**
 * Get current API status for debugging
 */
export function getAPIStatus() {
  return apiProvider.getStatus()
}
