import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import axiosRetry, {
  type AxiosRetry,
  exponentialDelay,
  isIdempotentRequestError,
} from 'axios-retry'

import { errorInterceptor } from './error-interceptor.js'
import { serializeUrlSearchParams } from './url-search-params-serializer.js'

export type Client = AxiosInstance

export const defaultTimeout = 30_000

export interface ClientOptions {
  /**
   * Request timeout in milliseconds, applied per attempt.
   * Set to 0 to disable the timeout. Defaults to 30 seconds.
   */
  timeout?: number

  /**
   * Options passed to the underlying Axios client.
   */
  axiosOptions?: AxiosRequestConfig

  /**
   * Options passed to axios-retry,
   * which retries idempotent requests that fail
   * because of a transport error, timeout, or HTTP 429 response.
   */
  axiosRetryOptions?: AxiosRetryConfig
}

type AxiosRetryConfig = Parameters<AxiosRetry>[1]

type RequiredAxiosRetryConfig = Required<NonNullable<AxiosRetryConfig>>

const defaultAxiosRetryOptions = {
  retries: 2,
  retryCondition: isIdempotentRequestError,
  retryDelay: exponentialDelay,
  shouldResetTimeout: true,
  onRetry: () => undefined,
  onMaxRetryTimesExceeded: () => undefined,
  validateResponse: null,
} satisfies RequiredAxiosRetryConfig

export const createClient = (options: ClientOptions): AxiosInstance => {
  const client = axios.create({
    paramsSerializer: serializeUrlSearchParams,
    adapter: 'fetch',
    timeout: options.timeout ?? defaultTimeout,
    ...options.axiosOptions,
  })

  axiosRetry(client, {
    ...defaultAxiosRetryOptions,
    ...options.axiosRetryOptions,
  })

  client.interceptors.response.use(undefined, errorInterceptor)

  return client
}
