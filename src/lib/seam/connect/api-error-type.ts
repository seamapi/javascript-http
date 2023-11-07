// UPSTREAM: These types should be provided by @seamapi/types/connect.

export interface ApiErrorResponse {
  error: ApiError
}

export interface ApiError {
  type: string
  message: string
  data?: unknown
}

export interface ApiInvalidInputError extends ApiError {
  type: 'invalid_input'
}
