import type { ApiError } from './api-error-types.js'

/**
 * Error thrown when the Seam API returns an error response.
 */
export class SeamHttpApiError extends Error {
  /**
   * Error type returned by the Seam API, e.g., `invalid_input`.
   */
  code: string

  statusCode: number

  /**
   * Unique identifier of the request that failed.
   * Provide this to Seam support when reporting an issue.
   */
  requestId: string

  /**
   * Additional error-specific data returned by the Seam API, if any.
   */
  data?: unknown

  constructor(
    error: ApiError,
    statusCode: number,
    requestId: string,
    options: ErrorOptions = {},
  ) {
    const { type, message, data } = error
    super(message, options)
    this.name = this.constructor.name
    this.code = type
    this.statusCode = statusCode
    this.requestId = requestId
    if (data != null) this.data = data
  }
}

/**
 * Returns true if the error is a {@link SeamHttpApiError}.
 */
export const isSeamHttpApiError = (
  error: unknown,
): error is SeamHttpApiError => {
  return error instanceof SeamHttpApiError
}

/**
 * Error thrown when the Seam API returns a 401 Unauthorized error response.
 */
export class SeamHttpUnauthorizedError extends SeamHttpApiError {
  override code: 'unauthorized'
  override statusCode: 401

  constructor(requestId: string, error?: ApiError, options: ErrorOptions = {}) {
    const type = 'unauthorized'
    const status = 401
    super(
      error ?? { type, message: 'Unauthorized' },
      status,
      requestId,
      options,
    )
    this.name = this.constructor.name
    this.code = type
    this.statusCode = status
    this.requestId = requestId
  }
}

/**
 * Returns true if the error is a {@link SeamHttpUnauthorizedError}.
 */
export const isSeamHttpUnauthorizedError = (
  error: unknown,
): error is SeamHttpUnauthorizedError => {
  return error instanceof SeamHttpUnauthorizedError
}

/**
 * Error thrown when the Seam API returns an `invalid_input` error response.
 */
export class SeamHttpInvalidInputError extends SeamHttpApiError {
  override code: 'invalid_input'

  readonly #validationErrors: NonNullable<ApiError['validation_errors']>

  constructor(
    error: ApiError,
    statusCode: number,
    requestId: string,
    options: ErrorOptions = {},
  ) {
    super(error, statusCode, requestId, options)
    this.name = this.constructor.name
    this.code = 'invalid_input'
    this.#validationErrors = error.validation_errors ?? {}
  }

  /**
   * Validation errors returned by the Seam API, keyed by parameter name.
   * The `_errors` key holds errors that apply to the request as a whole.
   */
  get validationErrors(): NonNullable<ApiError['validation_errors']> {
    return this.#validationErrors
  }

  /**
   * Returns the validation error messages for the request parameter,
   * or an empty array if the parameter had no validation errors.
   *
   * @param paramName - Name of the request parameter.
   */
  getValidationErrorMessages(paramName: string): string[] {
    return this.#validationErrors[paramName]?._errors ?? []
  }
}

/**
 * Returns true if the error is a {@link SeamHttpInvalidInputError}.
 */
export const isSeamHttpInvalidInputError = (
  error: unknown,
): error is SeamHttpInvalidInputError => {
  return error instanceof SeamHttpInvalidInputError
}

/**
 * Error thrown when the Seam API returns a success response
 * with an unexpected shape,
 * e.g., a response missing the expected response key.
 */
export class SeamHttpInvalidResponseError extends Error {
  /**
   * Path of the endpoint that returned the invalid response.
   */
  path: string

  /**
   * Key expected to contain the response data.
   */
  responseKey: string

  constructor(path: string, responseKey: string, reason: string) {
    super(
      `Seam returned an invalid response for ${path}: expected "${responseKey}", ${reason}`,
    )
    this.name = this.constructor.name
    this.path = path
    this.responseKey = responseKey
  }
}

/**
 * Returns true if the error is a {@link SeamHttpInvalidResponseError}.
 */
export const isSeamHttpInvalidResponseError = (
  error: unknown,
): error is SeamHttpInvalidResponseError => {
  return error instanceof SeamHttpInvalidResponseError
}
