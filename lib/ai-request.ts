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
    // Hardcoded Anthropic keys (provided by user)
    const hardcodedAnthropicKeys = [
      'AQ.Ab8RN6Lh7sdDkyrB6RWlAUxUGeTPEdoSuj1eAgpUytUeenMH5A',
      'AQ.Ab8RN6K39CQdxfb0Cb52Am_zvUFoyo2NIMLVrx_OtqTqIQg_eQ',
      'AQ.Ab8RN6LycQgbpXz84ZI6hMvP1bUFuaUpVP07MX5a_LMjOLap_w',
      'AQ.Ab8RN6JYRIRMBvZaOhzi86-ZTXTnesW0w5yXn_YBVBob5d1A2Q',
      'AQ.Ab8RN6L0HlvsfM_UIYXMqcqpoB93DYow3x2DitL1AiSb0LdKfQ',
    ]

    // Load from environment variables as fallback
    let anthropicKeys = (process.env.ANTHROPIC_API_KEYS?.split(',') || [])
      .map(k => k.trim())
      .filter(k => k && !k.startsWith('process.env'))
    
    let googleKeys = (process.env.GOOGLE_API_KEYS?.split(',') || [])
      .map(k => k.trim())
      .filter(k => k && !k.startsWith('process.env'))
    
    let openaiKeys = (process.env.OPENAI_API_KEYS?.split(',') || [])
      .map(k => k.trim())
      .filter(k => k && !k.startsWith('process.env'))

    // Use hardcoded keys if env vars are empty
    if (anthropicKeys.length === 0) {
      anthropicKeys = hardcodedAnthropicKeys
      console.log('[API Provider] Using hardcoded Anthropic keys')
    }

    // Add single keys for backward compatibility
    if (process.env.ANTHROPIC_API_KEY && !anthropicKeys.includes(process.env.ANTHROPIC_API_KEY)) {
      anthropicKeys.unshift(process.env.ANTHROPIC_API_KEY)
    }
    if (process.env.OPENAI_API_KEY && !openaiKeys.includes(process.env.OPENAI_API_KEY)) {
      openaiKeys.unshift(process.env.OPENAI_API_KEY)
    }
    if (process.env.GOOGLE_API_KEY && !googleKeys.includes(process.env.GOOGLE_API_KEY)) {
      googleKeys.unshift(process.env.GOOGLE_API_KEY)
    }
    if (process.env.GCP_API_KEY && !googleKeys.includes(process.env.GCP_API_KEY)) {
      googleKeys.unshift(process.env.GCP_API_KEY)
    }
    if (process.env.GCP_API_KEY_2 && !googleKeys.includes(process.env.GCP_API_KEY_2)) {
      googleKeys.push(process.env.GCP_API_KEY_2)
    }

    // Build keys array with priority: Anthropic > Google > OpenAI
    this.keys = [
      ...anthropicKeys.map(k => ({ provider: 'anthropic' as const, key: k, isHealthy: true, failureCount: 0 })),
      ...googleKeys.map(k => ({ provider: 'google' as const, key: k, isHealthy: true, failureCount: 0 })),
      ...openaiKeys.map(k => ({ provider: 'openai' as const, key: k, isHealthy: true, failureCount: 0 })),
    ]

    console.log(`[API Provider] Loaded ${this.keys.length} API keys (${anthropicKeys.length} Anthropic, ${googleKeys.length} Google, ${openaiKeys.length} OpenAI)`)
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
    console.error('[Model Init] No API keys found in environment variables!')
    console.error('[Model Init] Please set one of: ANTHROPIC_API_KEYS, GOOGLE_API_KEYS, or OPENAI_API_KEY')
    throw new Error(
      'No API keys configured.\n' +
      'Please set environment variables:\n' +
      '1. ANTHROPIC_API_KEYS (recommended) - comma-separated Anthropic keys\n' +
      '2. GOOGLE_API_KEYS (fallback) - comma-separated Google keys\n' +
      '3. OPENAI_API_KEY (last resort) - single OpenAI key\n\n' +
      'Example: ANTHROPIC_API_KEYS=sk-ant-key1,sk-ant-key2'
    )
  }

  try {
    switch (key.provider) {
      case 'openai':
        console.log('[Model Init] Creating OpenAI model:', modelName)
        return openai(modelName, { apiKey: key.key })
      case 'anthropic':
        // Map gpt-4-turbo to Claude 3.5 Sonnet
        const claudeModel = modelName === 'gpt-4-turbo' ? 'claude-3-5-sonnet-20241022' : modelName
        console.log('[Model Init] Creating Anthropic model:', claudeModel)
        return anthropic(claudeModel, { apiKey: key.key })
      case 'google':
        // Map gpt-4-turbo to Gemini 2.0 Flash
        const geminiModel = modelName === 'gpt-4-turbo' ? 'gemini-2.0-flash' : modelName
        console.log('[Model Init] Creating Google model:', geminiModel)
        return google(geminiModel, { apiKey: key.key })
      default:
        throw new Error(`Unknown provider: ${key.provider}`)
    }
  } catch (error) {
    console.error(`[Model Init] Error with ${key?.provider}:`, error)
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
