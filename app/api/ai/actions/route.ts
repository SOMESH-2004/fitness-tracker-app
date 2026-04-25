export interface AIAction {
  type: 'update_goal' | 'add_workout' | 'update_diet' | 'add_todo' | 'modify_plan'
  payload: any
  description: string
}

/**
 * This endpoint allows the AI to suggest or execute actions that modify the app state
 * The user must approve these actions before they take effect
 */
export async function POST(req: Request) {
  try {
    const { action } = await req.body.json()

    // Validate action type
    const validActions = [
      'update_goal',
      'add_workout',
      'update_diet',
      'add_todo',
      'modify_plan',
    ]

    if (!validActions.includes(action.type)) {
      return Response.json(
        { error: 'Invalid action type' },
        { status: 400 }
      )
    }

    // Parse and validate the action payload
    let executionResult = {
      success: true,
      action: action.type,
      message: '',
      data: null,
    }

    switch (action.type) {
      case 'update_goal': {
        // Example: update fitness goals
        if (!action.payload.goalType || !action.payload.value) {
          return Response.json(
            { error: 'Missing required fields for update_goal' },
            { status: 400 }
          )
        }
        executionResult.message = `Goal updated: ${action.payload.goalType} = ${action.payload.value}`
        executionResult.data = action.payload
        break
      }

      case 'add_workout': {
        // Example: suggest new workout
        if (!action.payload.name || !action.payload.duration) {
          return Response.json(
            { error: 'Missing required fields for add_workout' },
            { status: 400 }
          )
        }
        executionResult.message = `Workout suggested: ${action.payload.name} (${action.payload.duration} min)`
        executionResult.data = action.payload
        break
      }

      case 'update_diet': {
        // Example: suggest dietary changes
        if (!action.payload.mealType || !action.payload.suggestion) {
          return Response.json(
            { error: 'Missing required fields for update_diet' },
            { status: 400 }
          )
        }
        executionResult.message = `Diet suggestion: ${action.payload.mealType} - ${action.payload.suggestion}`
        executionResult.data = action.payload
        break
      }

      case 'add_todo': {
        // Example: create task from AI suggestion
        if (!action.payload.title) {
          return Response.json(
            { error: 'Missing required fields for add_todo' },
            { status: 400 }
          )
        }
        executionResult.message = `Todo created: ${action.payload.title}`
        executionResult.data = action.payload
        break
      }

      case 'modify_plan': {
        // Example: modify the fitness plan
        if (!action.payload.planType) {
          return Response.json(
            { error: 'Missing required fields for modify_plan' },
            { status: 400 }
          )
        }
        executionResult.message = `Plan modified: ${action.payload.planType}`
        executionResult.data = action.payload
        break
      }
    }

    return Response.json(executionResult, { status: 200 })
  } catch (error) {
    console.error('AI action error:', error)
    return Response.json(
      { error: 'Failed to process AI action' },
      { status: 500 }
    )
  }
}
