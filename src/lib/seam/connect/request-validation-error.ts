export class SeamHttpRequestValidationError extends Error {
  requestId?: string

  constructor(requestId: string | undefined) {
    super('TODO')
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    if (requestId != null) this.requestId = requestId
  }
}
