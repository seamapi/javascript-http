import axios, { type Axios } from 'axios'

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
  // TODO: axiosRetry? Allow options to configure this if so
  return axios.create({
    baseURL: options.endpoint,
    withCredentials: isSeamHttpOptionsWithClientSessionToken(options),
    paramsSerializer,
    ...options.axiosOptions,
    headers: {
      ...getAuthHeaders(options),
      ...options.axiosOptions.headers,
      // TODO: User-Agent
    },
  })
}
