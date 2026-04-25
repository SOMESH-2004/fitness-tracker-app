# AI Fitness Assistant Guide

## Overview

The AI Fitness Assistant is an intelligent coaching feature that provides:
- **Real-time Alerts**: Notifications about weight changes, calorie deviations, missed workouts
- **Smart Suggestions**: Personalized diet and workout recommendations based on your progress
- **Deep Analysis**: Detailed insights into your progress trends, workout consistency, eating patterns, and goal alignment
- **Personalized Plans**: AI-generated 7-day diet and workout plans tailored to your goals

## Features

### 1. Real-Time Alerts
The AI continuously monitors your data and generates alerts for:
- Weight gain/loss trends
- Calorie intake deviations (exceeding goals or eating too little)
- Workout consistency changes
- Progress toward weight goals

### 2. Smart Suggestions
Based on your alerts and progress, the AI provides:
- Dietary recommendations
- Workout adjustments
- Motivation and encouragement
- Specific action items

### 3. Detailed Analysis
Choose from 4 analysis types in the sidebar:

#### Progress Trend Analysis
- Weight loss/gain patterns
- Weekly progress velocity
- Time to goal estimation
- Trend visualization

#### Workout Consistency Analysis
- Weekly workout frequency
- Consistency rating (poor to excellent)
- Recommendations for increasing frequency
- Best times to workout

#### Eating Patterns Analysis
- Meal distribution analysis
- Imbalanced meal detection
- Nutritional pattern insights
- Dietary improvement suggestions

#### Goal Comparison Analysis
- Current vs. goal weight
- Calorie goal adherence
- Timeline to goal achievement
- Motivation-based feedback

## How to Use

### Setup
1. **Add API Key**: Set your `OPENAI_API_KEY` in project settings (Vars section)
2. **No Configuration**: The AI Assistant starts working immediately once the key is added
3. **Auto-Analysis**: The sidebar automatically analyzes your data whenever you update workouts, meals, or weight

### In the App
1. **View Suggestions Tab**: See real-time alerts and AI suggestions as you log activities
2. **Run Analysis**: Click any analysis button (Progress, Workouts, Diet, Goals) for detailed insights
3. **Clear Alerts**: Remove alerts you've addressed using the "Clear Alerts" button

## Architecture

### Components
- **`/components/ai-sidebar.tsx`**: Main UI widget with tabs for suggestions and analysis
- **`/components/fitness-tracker.tsx`**: Updated to include sidebar and data collection

### API Routes
- **`/app/api/ai/analyze/route.ts`**: Generates detailed analysis based on user data
- **`/app/api/ai/suggestions/route.ts`**: Streams real-time suggestions based on alerts

### Utilities & Context
- **`/lib/ai-analysis.ts`**: Data analysis functions for detecting trends and anomalies
- **`/context/ai-context.tsx`**: React Context for managing AI state globally

### Data Flow
```
User Updates Data (meal, workout, weight)
  ↓
Component calls onUpdate() callback
  ↓
FitnessTracker collects all user stats
  ↓
AIProvider.analyzeProgress() runs analysis utilities
  ↓
Real-time alerts generated
  ↓
generateSuggestion() calls API for streaming AI response
  ↓
AISidebar displays alerts and suggestions
```

## Alert System

### Alert Types
- **Warning** (High/Medium): Negative trends, missed goals
- **Info** (Low): Suggestions for improvement
- **Success** (Low): Positive progress, encouragement

### Alert Severity Levels
- **High**: Critical issues (very low workout frequency, significant calorie overage)
- **Medium**: Important notices (weight gain trend, moderate overeating)
- **Low**: Tips and encouragement (slight improvements, positive feedback)

## Customization

### Modifying Alert Thresholds
Edit `/lib/ai-analysis.ts` functions:
```typescript
// Example: Change weight gain alert threshold
if (weeklyChange > 0.5) trend = 'gaining'  // Change 0.5 to different value
```

### Changing AI Model
Edit API routes to use different OpenAI models:
```typescript
model: openai('gpt-4-turbo')  // Change to 'gpt-3.5-turbo', 'gpt-4', etc.
```

### Customizing Prompts
Modify system and user prompts in:
- `/app/api/ai/analyze/route.ts` - Analysis generation
- `/app/api/ai/suggestions/route.ts` - Real-time suggestions

## Troubleshooting

### AI not generating suggestions
- Check that `OPENAI_API_KEY` is set in project settings (Vars)
- Verify API key is valid and has available credits
- Check browser console for error messages

### Sidebar not appearing
- Ensure you're on a desktop (sidebar hidden on mobile)
- Refresh the page to reload components
- Check that AIProvider is wrapping the app in layout.tsx

### Alerts not updating
- Log a new meal, workout, or weight entry to trigger analysis
- Manual re-analysis happens on component mount
- Clear alerts and re-log data to see fresh analysis

### API errors
- Verify OpenAI API key has correct permissions
- Check network tab in browser dev tools
- Review API usage in OpenAI dashboard

## Performance Notes

- Alerts are generated locally without API calls
- AI analysis uses streaming for faster response display
- Suggestions are generated on-demand when alerts are present
- Sidebar updates automatically when user data changes

## Security

- API key is stored securely as environment variable
- No user data is stored beyond local browser storage
- All AI calls go directly to OpenAI (no intermediary servers)
- Consider Supabase integration for cross-device data sync

## Future Enhancements

- Multi-day workout plan generation
- Meal plan with recipes
- Integration with fitness tracking wearables
- Voice-based coaching
- Social challenges and leaderboards
- Nutritional macros breakdown
