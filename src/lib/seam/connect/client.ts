import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
// @ts-expect-error https://github.com/svsool/axios-better-stacktrace/issues/12
import axiosBetterStacktrace from 'axios-better-stacktrace'
import axiosRetry, { type AxiosRetry, exponentialDelay } from 'axios-retry'

import { paramsSerializer } from 'lib/params-serializer.js'

import { errorInterceptor } from './error-interceptor.js'

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
