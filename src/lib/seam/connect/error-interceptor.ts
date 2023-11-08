import { type AxiosError, isAxiosError } from 'axios'

import type { ApiErrorResponse } from './api-error-type.js'
import {
  SeamHttpApiError,
  SeamHttpInvalidInputError,
  SeamHttpUnauthorizedError,
} from './seam-http-error.js'

export const errorInterceptor = async (err: unknown): Promise<void> => {
  if (!isAxiosError(err)) throw err

  const status = err.response?.status
  const headers = err.response?.headers
  const requestId = headers?.['seam-request-id'] ?? ''

  if (status == null) throw err

  if (status === 401) {
    throw new SeamHttpUnauthorizedError(requestId)
  }

  if (!isApiErrorResponse(err)) throw err

  const { response } = err
  if (response == null) throw err

  const { type } = response.data.error

  const args = [response.data.error, status, requestId] as const

  if (type === 'invalid_input') throw new SeamHttpInvalidInputError(...args)
  throw new SeamHttpApiError(...args)
}

const isApiErrorResponse = (
  err: AxiosError,
): err is AxiosError<ApiErrorResponse> => {
  const headers = err.response?.headers
  if (headers == null) return false

  const contentType = headers['content-type']
  if (
    typeof contentType === 'string' &&
    !contentType.startsWith('application/json')
  ) {
    return false
  }

  const data = err.response?.data
  if (typeof data === 'object' && data != null) {
    return (
      'error' in data &&
      typeof data.error === 'object' &&
      data.error != null &&
      'type' in data.error &&
      typeof data.error === 'string'
    )
  }

  return false
}
