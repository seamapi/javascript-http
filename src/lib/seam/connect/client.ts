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
import { LegacyWorkspaces } from './legacy/workspaces.js'
import { Workspaces } from './routes/workspaces.js'

export class SeamHttp {
  client: Axios

  #legacy: boolean

  constructor(apiKeyOrOptions: string | SeamHttpOptions) {
    const options = parseOptions(
      typeof apiKeyOrOptions === 'string'
        ? { apiKey: apiKeyOrOptions }
        : apiKeyOrOptions,
    )

    this.#legacy = options.enableLegacyMethodBehaivor

    // TODO: axiosRetry? Allow options to configure this if so
    this.client = axios.create({
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

  // TODO
  // static fromPublishableKey and deprecate getClientSessionToken

  // TODO: Should we keep makeRequest?
  // Better to implement error handling and wrapping in an error handler.
  // makeRequest

  get workspaces(): Workspaces {
    const workspaces = new Workspaces(this.client)
    if (this.#legacy) return new LegacyWorkspaces(this.client)
    return workspaces
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
    enableLegacyMethodBehaivor: false,
  }
}
