import axios, { type Axios } from 'axios'

import { getAuthHeaders } from './auth.js'
import {
  InvalidSeamHttpOptionsError,
  isSeamHttpOptionsWithApiKey,
  isSeamHttpOptionsWithClientSessionToken,
  type SeamHttpOptions,
  type SeamHttpOptionsWithApiKey,
  type SeamHttpOptionsWithClientSessionToken,
} from './client-options.js'
import { Workspaces } from './routes/workspaces.js'

export class SeamHttp {
  client: Axios

  constructor(apiKeyOrOptions: string | SeamHttpOptions) {
    const options = parseOptions(
      typeof apiKeyOrOptions === 'string'
        ? { apiKey: apiKeyOrOptions }
        : apiKeyOrOptions,
    )

    this.client = axios.create({
      baseURL: options.endpoint,
      ...options.axiosOptions,
      headers: {
        ...getAuthHeaders(options),
        ...options.axiosOptions.headers,
      },
    })
  }

  static fromApiKey(
    apiKey: SeamHttpOptionsWithApiKey['apiKey'],
    options: Omit<SeamHttpOptionsWithApiKey, 'apiKey'> = {},
  ): SeamHttp {
    const opts = { ...options, apiKey }
    if (!isSeamHttpOptionsWithApiKey(opts)) {
      throw new InvalidSeamHttpOptionsError('Missing apiKey')
    }
    return new SeamHttp(opts)
  }

  static fromClientSessionToken(
    clientSessionToken: SeamHttpOptionsWithClientSessionToken['clientSessionToken'],
    options: Omit<
      SeamHttpOptionsWithClientSessionToken,
      'clientSessionToken'
    > = {},
  ): SeamHttp {
    const opts = { ...options, clientSessionToken }
    if (!isSeamHttpOptionsWithClientSessionToken(opts)) {
      throw new InvalidSeamHttpOptionsError('Missing clientSessionToken')
    }
    return new SeamHttp(opts)
  }

  get workspaces(): Workspaces {
    return new Workspaces(this.client)
  }
}

const parseOptions = (options: SeamHttpOptions): Required<SeamHttpOptions> => {
  const endpoint =
    options.endpoint ??
    globalThis?.process?.env?.['SEAM_ENDPOINT'] ??
    globalThis?.process?.env?.['SEAM_API_URL'] ??
    'https://connect.getseam.com'

  const apiKey =
    'apiKey' in options
      ? options.apiKey
      : globalThis.process?.env?.['SEAM_API_KEY']

  return {
    ...options,
    ...(apiKey != null ? { apiKey } : {}),
    endpoint,
    axiosOptions: options.axiosOptions ?? {},
  }
}
