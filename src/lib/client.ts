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

export const createClient = (options: ClientOptions): AxiosInstance => {
  const client = axios.create({
    paramsSerializer: serializeUrlSearchParams,
    adapter: 'fetch',
    timeout: options.timeout ?? defaultTimeout,
    ...options.axiosOptions,
  })

  axiosRetry(client, {
    retries: 2,
    retryDelay: exponentialDelay,
    // axios-retry's own default, isNetworkOrIdempotentRequestError, retries
    // network errors (e.g., a connection reset or a timeout) regardless of
    // HTTP method. That resends the body of an in-flight, non-idempotent
    // request (e.g., a POST) whenever the client never saw a response,
    // even though the server may have already received and processed it.
    // Restrict retries to methods that are safe to send more than once.
    retryCondition: isIdempotentRequestError,
    ...options.axiosRetryOptions,
  })

  client.interceptors.response.use(undefined, errorInterceptor)

  return client
}
