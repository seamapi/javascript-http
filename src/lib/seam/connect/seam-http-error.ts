import type { ApiError } from './api-error-type.js'

export class SeamHttpApiError extends Error {
  code: string
  statusCode: number
  requestId: string
  data?: unknown

  constructor(error: ApiError, statusCode: number, requestId: string) {
    const { type, message, data } = error
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.code = type
    this.statusCode = statusCode
    this.requestId = requestId
    if (data != null) this.data = data
  }
}

export class SeamHttpUnauthorizedError extends SeamHttpApiError {
  override code: 'unauthorized'
  override statusCode: 401

  constructor(requestId: string) {
    super({ type: 'unauthorized', message: 'Unauthorized' }, 401, requestId)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.code = 'unauthorized'
    this.statusCode = 401
    this.requestId = requestId
  }
}

export class SeamHttpInvalidInputError extends SeamHttpApiError {
  override code: 'invalid_input'

  constructor(error: ApiError, statusCode: number, requestId: string) {
    super(error, statusCode, requestId)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.code = 'invalid_input'
  }
}
