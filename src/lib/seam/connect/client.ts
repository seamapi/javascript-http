import axios, { type Axios, type AxiosRequestConfig } from 'axios'
import axiosRetry, { type AxiosRetry, exponentialDelay } from 'axios-retry'

import { paramsSerializer } from 'lib/params-serializer.js'

import { getAuthHeaders } from './auth.js'
import {
  isSeamHttpOptionsWithClient,
  isSeamHttpOptionsWithClientSessionToken,
  type SeamHttpOptions,
} from './options.js'

export type Client = Axios

export interface ClientOptions {
  endpoint?: string
  axiosOptions?: AxiosRequestConfig
  axiosRetryOptions?: AxiosRetryConfig
}

type AxiosRetryConfig = Parameters<AxiosRetry>[1]

type Options =
  | Required<SeamHttpOptions>
  | (Required<ClientOptions> & { publishableKey: string })

export const createClient = (options: Options): Axios => {
  if (isSeamHttpOptionsWithClient(options)) return options.client

  const client = axios.create({
    baseURL: options.endpoint,
    withCredentials: isSeamHttpOptionsWithClientSessionToken(options),
    paramsSerializer,
    ...options.axiosOptions,
    headers: {
      ...getAuthHeaders(options),
      ...options.axiosOptions.headers,
    },
  })

  axiosRetry(client, {
    retries: 2,
    retryDelay: exponentialDelay,
    ...options.axiosRetryOptions,
  })

  return client
}
