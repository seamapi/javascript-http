import axios, { type Axios, type AxiosRequestConfig } from 'axios'
import axiosRetry, { type AxiosRetry, exponentialDelay } from 'axios-retry'

import { paramsSerializer } from 'lib/params-serializer.js'

export type Client = Axios

export interface ClientOptions {
  axiosOptions?: AxiosRequestConfig
  axiosRetryOptions?: AxiosRetryConfig
  client?: Client
}

type AxiosRetryConfig = Parameters<AxiosRetry>[1]

export const createClient = (options: ClientOptions): Axios => {
  if (options.client != null) return options.client

  const client = axios.create({
    paramsSerializer,
    ...options.axiosOptions,
  })

  axiosRetry(client, {
    retries: 2,
    retryDelay: exponentialDelay,
    ...options.axiosRetryOptions,
  })

  return client
}
