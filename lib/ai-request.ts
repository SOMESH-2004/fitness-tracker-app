// AI Request wrapper with multi-provider fallback support
import { streamText, generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import apiKeyManager from './api-key-manager'

interface AIRequestOptions {
  messages?: Array<{ role: string; content: string }>
  prompt?: string
  system?: string
  maxTokens?: number
  temperature?: number
  timeout?: number
}

/**
 * Execute AI request with automatic fallback to next provider on failure
 */
export async function executeAIRequest(
  requestFn: (apiKey: string) => Promise<any>,
  maxRetries: number = 3
): Promise<any> {
  let lastError: Error | null = null
  let attempts = 0

  while (attempts < maxRetries) {
    try {
      const keyStatus = apiKeyManager.getCurrentKey()
      console.log(`[AI Request] Attempt ${attempts + 1}/${maxRetries} with ${keyStatus.provider}`)

      const result = await requestFn(keyStatus.key)

      // Mark as successful
      apiKeyManager.reportSuccess()
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`[AI Request] Error on attempt ${attempts + 1}:`, errorMessage)

      apiKeyManager.reportFailure(errorMessage)
      lastError = error instanceof Error ? error : new Error(String(error))
      attempts++

      // Wait before retry (exponential backoff)
      if (attempts < maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempts - 1), 10000)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }

  throw new Error(
    `Failed to execute AI request after ${maxRetries} attempts. Last error: ${lastError?.message}`
  )
}

/**
 * Stream text with fallback support
 */
export async function streamTextWithFallback(
  options: AIRequestOptions & { model?: string }
) {
  return executeAIRequest(async (apiKey: string) => {
    const model = options.model || 'gpt-4-turbo'

    return streamText({
      model: openai(model, { apiKey }),
      system: options.system,
      messages: options.messages ? options.messages.map(m => ({ ...m })) : undefined,
      prompt: options.prompt,
      maxTokens: options.maxTokens || 1024,
      temperature: options.temperature || 0.7,
    })
  })
}

/**
 * Generate text with fallback support
 */
export async function generateTextWithFallback(
  options: AIRequestOptions & { model?: string }
) {
  return executeAIRequest(async (apiKey: string) => {
    const model = options.model || 'gpt-4-turbo'

    return generateText({
      model: openai(model, { apiKey }),
      system: options.system,
      messages: options.messages ? options.messages.map(m => ({ ...m })) : undefined,
      prompt: options.prompt,
      maxTokens: options.maxTokens || 1024,
      temperature: options.temperature || 0.7,
    })
  })
}

/**
 * Get current API status for debugging
 */
export function getAPIStatus() {
  return apiKeyManager.getStatus()
}
