import { SeamHttpApiError } from './api-error.js'

// UPSTREAM: Should be provided by @seamapi/types.
interface InvalidInputError {
  type: 'invalid_input'
  message: string
  data?: unknown
}

export class SeamHttpInvalidInputError extends SeamHttpApiError {
  override code: 'invalid_input'

  constructor(error: InvalidInputError, statusCode: number, requestId: string) {
    super(error, statusCode, requestId)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.code = error.type
  }
}
