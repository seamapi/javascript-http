import { serializeUrlSearchParams } from '@seamapi/url-search-params-serializer'
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import axiosRetry, {
  type AxiosRetry,
  exponentialDelay,
  isIdempotentRequestError,
} from 'axios-retry'

import { errorInterceptor } from './error-interceptor.js'

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
    retryCondition: isIdempotentRequestError,
    retryDelay: exponentialDelay,
    shouldResetTimeout: true,
    ...options.axiosRetryOptions,
  })

  client.interceptors.response.use(undefined, errorInterceptor)

  return client
}
