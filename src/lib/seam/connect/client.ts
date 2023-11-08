import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  isAxiosError,
} from 'axios'
// @ts-expect-error https://github.com/svsool/axios-better-stacktrace/issues/12
import axiosBetterStacktrace from 'axios-better-stacktrace'
import axiosRetry, { type AxiosRetry, exponentialDelay } from 'axios-retry'

import { paramsSerializer } from 'lib/params-serializer.js'

import type { ApiErrorResponse } from './api-error-type.js'
import {
  SeamHttpApiError,
  SeamHttpInvalidInputError,
  SeamHttpUnauthorizedError,
} from './seam-http-error.js'

export type Client = AxiosInstance

export interface ClientOptions {
  axiosOptions?: AxiosRequestConfig
  axiosRetryOptions?: AxiosRetryConfig
  client?: Client
}

type AxiosRetryConfig = Parameters<AxiosRetry>[1]

export const createClient = (options: ClientOptions): AxiosInstance => {
  if (options.client != null) return options.client

  const client = axios.create({
    paramsSerializer,
    ...options.axiosOptions,
  })

  axiosBetterStacktrace(axios)

  // @ts-expect-error https://github.com/softonic/axios-retry/issues/159
  axiosRetry(client, {
    retries: 2,
    retryDelay: exponentialDelay,
    ...options.axiosRetryOptions,
  })

  client.interceptors.response.use(undefined, errorInterceptor)

  return client
}

const errorInterceptor = async (err: unknown): Promise<void> => {
  if (!isAxiosError(err)) {
    throw err
  }

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

  const data = err.response?.data as any
  if (typeof data === 'object') {
    return (
      'error' in data && typeof data.error === 'object' && 'type' in data.error
    )
  }

  return false
}
