# Multi-API Key System with Automatic Fallback

## Overview

FitTrack now supports multiple API keys with automatic fallback. If one API provider fails, the system automatically switches to the next available provider and retries the request.

## Supported Providers

1. **OpenAI** (gpt-4-turbo, gpt-4, gpt-3.5-turbo)
2. **Groq** (Fast inference models)
3. **Anthropic** (Claude models)
4. **Google** (Gemini models)

## Environment Variables Setup

Add your API keys to your `.env.local` or Vercel environment variables:

### Single Primary Key (Backward Compatible)
```
OPENAI_API_KEY=sk-...
```

### Multiple OpenAI Keys (Comma-Separated)
```
OPENAI_API_KEYS=sk-key1,sk-key2,sk-key3
```

### Multiple Keys Across Providers
```
OPENAI_API_KEYS=sk-openai1,sk-openai2
GROQ_API_KEYS=gsk-groq1,gsk-groq2
ANTHROPIC_API_KEYS=sk-ant1,sk-ant2
GOOGLE_API_KEYS=google-key1,google-key2
```

## How It Works

1. **Initialization**: System loads all provided API keys on startup
2. **Request**: Attempts to use the current healthy API key
3. **On Success**: Marks key as healthy and continues
4. **On Failure**: 
   - Reports failure to the key manager
   - After 3 consecutive failures, marks key as unhealthy
   - Automatically switches to next available key
   - Retries the request (up to 3 times total)
5. **Recovery**: Keys are reset if all become unhealthy

## Key Status Tracking

Each API key tracks:
- **Provider**: OpenAI, Groq, Anthropic, or Google
- **Healthy Status**: Whether the key is currently usable
- **Failure Count**: Number of consecutive failures
- **Success Count**: Total successful requests
- **Last Checked**: When the key was last used

## Retry Strategy

- **Max Retries**: 3 attempts per request
- **Backoff**: Exponential backoff between retries (1s, 2s, 4s max)
- **Threshold**: Keys marked unhealthy after 3 consecutive failures
- **Recovery**: Automatic reset if all keys become unhealthy

## Error Handling

If all API keys fail:
- System returns error with full API status information
- Client receives detailed error message and key health status
- All error responses include `apiStatus` object showing key health

### Example Error Response
```json
{
  "error": "Failed to execute AI request after 3 attempts",
  "apiStatus": [
    {
      "provider": "openai",
      "isHealthy": false,
      "failureCount": 3,
      "successCount": 2,
      "lastChecked": "2026-06-23T05:28:47.000Z",
      "masked": "sk-proj..."
    }
  ]
}
```

## Monitoring

Check API health status at any time:
- Each API route returns `apiStatus` in error responses
- Frontend can display which providers are working
- Logs show fallback attempts and provider switches

## Best Practices

1. **Provide Multiple Keys**: Set at least 2-3 keys per provider
2. **Different Providers**: Combine OpenAI + Groq for maximum reliability
3. **Monitor Quota**: Check your provider dashboards for rate limits
4. **Rotate Keys**: Periodically refresh API keys in production
5. **Error Alerts**: Set up notifications when all keys fail

## Example Vercel Environment Variables

Go to your Vercel Project → Settings → Environment Variables and add:

```
OPENAI_API_KEYS=sk-key1,sk-key2,sk-key3
GROQ_API_KEYS=gsk-groq1,gsk-groq2
```

The system will automatically:
- Try OpenAI keys first (3 total)
- Fall back to Groq keys if OpenAI fails
- Switch between providers automatically
- Maintain health status for each key

## Testing

To test the fallback system:

1. Set invalid primary key + valid secondary key
2. Make a request
3. System will fail on first key, switch to second
4. Request succeeds with second key

Frontend will show real-time status of which provider is active.
