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
  timeout?: number
  axiosOptions?: AxiosRequestConfig
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
