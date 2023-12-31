// UPSTREAM: These types should be provided by @seamapi/types/connect.

export interface ActionAttempt {
  action_attempt_id: string
  status: 'pending' | 'error' | 'success'
}

export type SuccessfulActionAttempt<T extends ActionAttempt> = T & {
  status: 'success'
}

export type PendingActionAttempt<T extends ActionAttempt> = T & {
  status: 'pending'
}

export type FailedActionAttempt<T extends ActionAttempt> = T & {
  status: 'error'
  error: {
    type: string
    message: string
  }
}
