import axios, { type Axios } from 'axios'

import { getAuthHeaders } from './auth.js'
import {
  isSeamHttpOptionsWithClientSessionToken,
  type SeamHttpOptions,
} from './client-options.js'

export const createAxiosClient = (
  options: Required<SeamHttpOptions>,
): Axios => {
  // TODO: axiosRetry? Allow options to configure this if so
  return axios.create({
    baseURL: options.endpoint,
    withCredentials: isSeamHttpOptionsWithClientSessionToken(options),
    ...options.axiosOptions,
    headers: {
      ...getAuthHeaders(options),
      ...options.axiosOptions.headers,
      // TODO: User-Agent
    },
  })
}
