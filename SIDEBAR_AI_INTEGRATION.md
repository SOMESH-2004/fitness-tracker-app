# AI Chat Integration with Sidebar

## Overview
The AI Chat feature has been fully integrated into the Fit Guru sidebar, making it accessible from anywhere in the app without taking up tab space in the main content area.

## Changes Made

### 1. Enhanced Fit Guru Sidebar Component
The `ai-sidebar.tsx` component now includes three tabs:
- **Tips** - Real-time alerts and smart fitness suggestions
- **Analyze** - Detailed analysis of progress trends, workouts, diet patterns, and goals
- **Chat** - Interactive conversation with Fit Guru

### 2. Chat Features in Sidebar
- **Real-time Messaging**: Send messages and receive instant responses from Fit Guru
- **Conversation History**: Chat history is maintained during your session
- **Smart Context**: Fit Guru has access to your fitness data and stats
- **User-Friendly Interface**: 
  - User messages appear in blue on the right
  - Fit Guru responses appear in gray on the left
  - Auto-scrolling to latest messages
  - Press Enter to send (Shift+Enter for new line)

### 3. UI Improvements
- Updated sidebar colors from green to blue theme
- Better visual hierarchy with three distinct tabs
- Improved loading states with spinners
- Error handling for API failures

### 4. Removed Tab
- The "AI Chat" tab has been removed from the main navigation
- Focus on Calories, Workouts, Diet, Progress, and Todos tabs
- AI Chat is now permanently available in the sidebar

## How to Use

### Access AI Chat from Sidebar
1. Look for the "AI Coach" sidebar on the right (desktop view)
2. Click the "Chat" tab
3. Type your fitness questions or requests
4. Press Enter or click the Send button

### Example Prompts
- "Create a workout plan for weight loss"
- "What should I eat for recovery?"
- "How am I progressing towards my goals?"
- "Give me motivation for today"
- "Adjust my calorie goal based on my progress"

### Available Anywhere
The sidebar is sticky and visible while scrolling through any content, so you can chat with your AI coach while:
- Logging your meals
- Tracking workouts
- Checking progress
- Managing todos

## Technical Architecture

### API Endpoint
- **POST /api/ai/chat** - Handles chat messages with OpenAI integration
- Requires: `OPENAI_API_KEY` environment variable
- Returns: AI-generated fitness coaching response

### Data Flow
1. User sends message through Chat tab
2. Message is added to local state
3. Request is sent to `/api/ai/chat` with:
   - User message
   - Chat history
   - Current user stats
4. AI responds with personalized fitness advice
5. Response is added to message history

### State Management
- Chat messages stored in component state
- User stats passed from parent component
- Auto-scrolling on new messages
- Loading states for better UX

## Notes
- Chat history is cleared on page refresh (session-based)
- AI can see your fitness data to provide better recommendations
- Without `OPENAI_API_KEY`, chat will show an error message
- Mobile view hides the sidebar for better space utilization
