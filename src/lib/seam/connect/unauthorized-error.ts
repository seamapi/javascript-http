import { SeamHttpApiError } from './api-error.js'

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
