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
