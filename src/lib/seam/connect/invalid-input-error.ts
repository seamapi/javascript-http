import { SeamHttpApiError } from './api-error.js'
import type { ApiError } from './api-error-type.js'

export class SeamHttpInvalidInputError extends SeamHttpApiError {
  override code: 'invalid_input'

  constructor(error: ApiError, statusCode: number, requestId: string) {
    super(error, statusCode, requestId)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.code = 'invalid_input'
  }
}
