import axios, { type Axios } from 'axios'
import axiosRetry, { exponentialDelay } from 'axios-retry'

import { paramsSerializer } from 'lib/params-serializer.js'

import { getAuthHeaders } from './auth.js'
import {
  isSeamHttpOptionsWithClient,
  isSeamHttpOptionsWithClientSessionToken,
  type SeamHttpOptions,
} from './client-options.js'

export const createAxiosClient = (
  options: Required<SeamHttpOptions>,
): Axios => {
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
