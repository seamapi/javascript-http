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

import { SeamHttpApiError } from './api-error.js'
import type { ApiErrorResponse } from './api-error-type.js'
import { SeamHttpInvalidInputError } from './invalid-input-error.js'

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

const errorInterceptor = async (error: unknown): Promise<void> => {
  if (!isAxiosError(error)) {
    throw error
  }

  if (
    error.response?.headers['Content-Type']
      ?.toString()
      ?.startsWith('application/json') ??
    false
  ) {
    throw error
  }

  const err = error as AxiosError<ApiErrorResponse>
  const { response } = err
  if (response == null) throw err

  const { type } = response.data.error

  const args = [
    response.data.error,
    response.status,
    response.headers['seam-request-id'] ?? '',
  ] as const

  if (type === 'invalid_input') throw new SeamHttpInvalidInputError(...args)
  throw new SeamHttpApiError(...args)
}
