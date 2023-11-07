// UPSTREAM: Should be provided by @seamapi/types.
interface ApiError {
  type: string
  message: string
  data?: unknown
}

export class SeamHttpApiError extends Error {
  code: string
  statusCode: number
  requestId?: string
  data?: unknown

  constructor(
    error: ApiError,
    statusCode: number,
    requestId: string | undefined,
  ) {
    const { type, message, data } = error
    super(
      `Seam API request failed with status ${statusCode} (${type}): ${message}`,
    )
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.code = type
    this.statusCode = statusCode
    if (data != null) this.data = data
    if (requestId != null) this.requestId = requestId
  }
}
