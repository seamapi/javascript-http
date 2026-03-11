export type ActionAttempt =
  | {
      action_attempt_id: string
      status: 'pending'
      action_type: string
      result: null
      error: null
    }
  | {
      action_attempt_id: string
      status: 'success'
      action_type: string
      result: unknown
      error: null
    }
  | {
      action_attempt_id: string
      status: 'error'
      action_type: string
      result: null
      error: { type: string; message: string }
    }
