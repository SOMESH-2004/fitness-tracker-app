// Multi-API Key Manager with fallback support
// Tracks API key health and automatically switches to working keys

interface ApiKeyStatus {
  key: string
  provider: 'openai' | 'groq' | 'anthropic' | 'google'
  isHealthy: boolean
  lastChecked: Date
  failureCount: number
  successCount: number
}

class APIKeyManager {
  private apiKeys: ApiKeyStatus[] = []
  private currentKeyIndex: number = 0
  private readonly MAX_FAILURES = 3
  private readonly HEALTH_CHECK_INTERVAL = 60000 // 1 minute

  constructor() {
    this.initializeKeys()
  }

  private initializeKeys() {
    // Parse environment variables for multiple API keys
    const openaiKeys = process.env.OPENAI_API_KEYS?.split(',').filter(Boolean) || []
    const groqKeys = process.env.GROQ_API_KEYS?.split(',').filter(Boolean) || []
    const anthropicKeys = process.env.ANTHROPIC_API_KEYS?.split(',').filter(Boolean) || []
    const googleKeys = process.env.GOOGLE_API_KEYS?.split(',').filter(Boolean) || []

    // Primary API key (backward compatibility)
    if (process.env.OPENAI_API_KEY) {
      openaiKeys.unshift(process.env.OPENAI_API_KEY)
    }
    if (process.env.GROQ_API_KEY) {
      groqKeys.unshift(process.env.GROQ_API_KEY)
    }
    if (process.env.ANTHROPIC_API_KEY) {
      anthropicKeys.unshift(process.env.ANTHROPIC_API_KEY)
    }
    if (process.env.GOOGLE_API_KEY) {
      googleKeys.unshift(process.env.GOOGLE_API_KEY)
    }

    // Prioritize by provider (OpenAI > Groq > Anthropic > Google)
    this.apiKeys = [
      ...openaiKeys.map(key => ({
        key,
        provider: 'openai' as const,
        isHealthy: true,
        lastChecked: new Date(),
        failureCount: 0,
        successCount: 0,
      })),
      ...groqKeys.map(key => ({
        key,
        provider: 'groq' as const,
        isHealthy: true,
        lastChecked: new Date(),
        failureCount: 0,
        successCount: 0,
      })),
      ...anthropicKeys.map(key => ({
        key,
        provider: 'anthropic' as const,
        isHealthy: true,
        lastChecked: new Date(),
        failureCount: 0,
        successCount: 0,
      })),
      ...googleKeys.map(key => ({
        key,
        provider: 'google' as const,
        isHealthy: true,
        lastChecked: new Date(),
        failureCount: 0,
        successCount: 0,
      })),
    ]

    if (this.apiKeys.length === 0) {
      throw new Error(
        'No API keys configured. Please set OPENAI_API_KEY or use OPENAI_API_KEYS, GROQ_API_KEYS, ANTHROPIC_API_KEYS, GOOGLE_API_KEYS'
      )
    }

    console.log(`[API Manager] Initialized with ${this.apiKeys.length} API keys`)
  }

  /**
   * Get the current healthy API key
   */
  getCurrentKey(): ApiKeyStatus {
    // Find a healthy key
    const healthyKey = this.apiKeys.find(k => k.isHealthy)
    if (healthyKey) {
      this.currentKeyIndex = this.apiKeys.indexOf(healthyKey)
      return healthyKey
    }

    // If no healthy keys, reset and try again
    console.warn('[API Manager] No healthy keys found, resetting health status')
    this.apiKeys.forEach(k => (k.isHealthy = true))
    return this.apiKeys[0]
  }

  /**
   * Report success for current API key
   */
  reportSuccess() {
    const current = this.apiKeys[this.currentKeyIndex]
    if (current) {
      current.successCount++
      current.failureCount = 0 // Reset failures on success
      current.isHealthy = true
      current.lastChecked = new Date()
      console.log(`[API Manager] Success with ${current.provider} (${current.successCount} total)`)
    }
  }

  /**
   * Report failure for current API key and switch to next
   */
  reportFailure(error?: string) {
    const current = this.apiKeys[this.currentKeyIndex]
    if (current) {
      current.failureCount++
      current.lastChecked = new Date()

      if (current.failureCount >= this.MAX_FAILURES) {
        current.isHealthy = false
        console.warn(
          `[API Manager] Marked ${current.provider} as unhealthy after ${current.failureCount} failures: ${error}`
        )
      } else {
        console.warn(`[API Manager] Failure #${current.failureCount} with ${current.provider}: ${error}`)
      }
    }

    // Try next key
    this.switchToNextKey()
  }

  /**
   * Switch to the next available API key
   */
  private switchToNextKey() {
    const startIndex = this.currentKeyIndex
    let found = false

    for (let i = 0; i < this.apiKeys.length; i++) {
      const nextIndex = (this.currentKeyIndex + 1) % this.apiKeys.length
      const nextKey = this.apiKeys[nextIndex]

      if (nextKey.isHealthy) {
        this.currentKeyIndex = nextIndex
        console.log(`[API Manager] Switched to ${nextKey.provider} provider`)
        found = true
        break
      }

      this.currentKeyIndex = nextIndex
    }

    if (!found) {
      console.warn('[API Manager] No healthy API keys available, cycling through all')
      this.currentKeyIndex = (startIndex + 1) % this.apiKeys.length
    }
  }

  /**
   * Get all available API keys for a provider
   */
  getKeysByProvider(provider: string): string[] {
    return this.apiKeys.filter(k => k.provider === provider).map(k => k.key)
  }

  /**
   * Get health status of all keys
   */
  getStatus() {
    return this.apiKeys.map(k => ({
      provider: k.provider,
      isHealthy: k.isHealthy,
      failureCount: k.failureCount,
      successCount: k.successCount,
      lastChecked: k.lastChecked,
      masked: k.key.slice(0, 8) + '...' + k.key.slice(-4),
    }))
  }
}

// Singleton instance
const apiKeyManager = new APIKeyManager()

export default apiKeyManager
export { APIKeyManager, ApiKeyStatus }
