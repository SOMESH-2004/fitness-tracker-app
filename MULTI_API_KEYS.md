# Multi-API Key System with Automatic Fallback

## Overview

FitTrack now supports multiple API keys with automatic fallback. If one API provider fails, the system automatically switches to the next available provider and retries the request.

## Supported Providers

1. **OpenAI** (gpt-4-turbo, gpt-4, gpt-3.5-turbo)
2. **Anthropic** (Claude models)
3. **Google** (Gemini models)

## Quick Start (Easiest Way)

Add just ONE API key to Vercel project settings:

**In Vercel Dashboard:**
1. Go to Project Settings → Environment Variables
2. Add: `OPENAI_API_KEY=sk-your-key-here`
3. Deploy and it works!

## Environment Variables Setup

### Option 1: Single Key (Recommended)
```
OPENAI_API_KEY=sk-...
```

### Option 2: Multiple Keys of Same Provider (Comma-Separated)
```
OPENAI_API_KEYS=sk-key1,sk-key2,sk-key3
```

### Option 3: Multiple Keys Across Providers (Maximum Reliability)
```
OPENAI_API_KEYS=sk-openai1,sk-openai2
ANTHROPIC_API_KEYS=sk-ant-key1,sk-ant-key2
GOOGLE_API_KEYS=google-key1,google-key2
```

## How It Works

1. **Initialization**: System loads all configured API keys
2. **Request**: Attempts to use the current healthy API key
3. **On Success**: Marks key as healthy, continues
4. **On Failure**: 
   - After 3 failures, marks key as unhealthy
   - Automatically switches to next available key
   - Retries request (up to 3 attempts)
5. **Recovery**: Keys reset if all become unhealthy

## Key Priority Order

When multiple providers configured:
1. OpenAI (tried first)
2. Anthropic (fallback)
3. Google (last resort)

## Retry Strategy

- **Max Retries**: 3 attempts per request
- **Backoff**: 1 second, then 2 seconds between retries
- **Threshold**: Keys marked unhealthy after 3 consecutive failures
- **Recovery**: Automatic reset if all keys fail

## Error Responses

When errors occur, you receive:
```json
{
  "error": "Failed to generate text after multiple attempts",
  "apiStatus": [
    { "provider": "openai", "isHealthy": true, "failureCount": 0 },
    { "provider": "anthropic", "isHealthy": false, "failureCount": 3 }
  ]
}
```

This helps debug which keys are working.

## Getting API Keys

- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/
- **Google**: https://aistudio.google.com/app/apikey

## Setup Steps

1. Get an API key from OpenAI, Anthropic, or Google
2. In Vercel Dashboard: Settings → Environment Variables
3. Add your key(s) using one of the formats above
4. Deploy
5. Your AI features now work with automatic fallback!

## Testing Multiple Keys

To test fallback with multiple keys:
1. Add a valid key and an invalid key: `OPENAI_API_KEYS=sk-invalid,sk-valid`
2. Make a request - system auto-switches to valid key
3. Request succeeds!

## Best Practices

1. **Start with One**: Begin with single `OPENAI_API_KEY`
2. **Add More Keys**: If hitting rate limits, add comma-separated keys
3. **Mix Providers**: Use different providers for reliability
4. **Monitor Usage**: Check provider dashboards for quotas
5. **Rotate Keys**: Update keys periodically in production

## Troubleshooting

**Error: "No API keys available"**
- Add at least one key: `OPENAI_API_KEY=sk-...`

**All keys failing?**
- Verify keys are valid on provider website
- Check for rate limiting in provider dashboard
- Ensure account has API credits

**Still getting errors?**
- Check Vercel Environment Variables are saved
- Redeploy after adding variables
- Check server logs for detailed error messages
