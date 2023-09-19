import axios, { type Axios } from 'axios'

import {
  getAuthHeadersForApiKey,
  getAuthHeadersForClientSessionToken,
} from './auth.js'
import {
  InvalidSeamHttpOptionsError,
  isSeamHttpOptionsWithApiKey,
  isSeamHttpOptionsWithClientSessionToken,
  type SeamHttpOptions,
  type SeamHttpOptionsWithApiKey,
  type SeamHttpOptionsWithClientSessionToken,
} from './client-options.js'

export class SeamHttp {
  client: Axios

  constructor(apiKeyOrOptions: string | SeamHttpOptions) {
    const options = parseOptions(
      typeof apiKeyOrOptions === 'string'
        ? { apiKey: apiKeyOrOptions }
        : apiKeyOrOptions,
    )

    const axiosOptions = {
      baseURL: options.endpoint,
      ...options.axiosOptions,
      headers: options.axiosOptions.headers ?? {},
    }

    if (isSeamHttpOptionsWithApiKey(options)) {
      this.client = axios.create({
        ...axiosOptions,
        headers: {
          ...getAuthHeadersForApiKey(options),
          ...axiosOptions.headers,
        },
      })
      return
    }

    if (isSeamHttpOptionsWithClientSessionToken(options)) {
      this.client = axios.create({
        ...axiosOptions,
        headers: {
          ...getAuthHeadersForClientSessionToken(options),
          ...axiosOptions.headers,
        },
      })
      return
    }

    throw new InvalidSeamHttpOptionsError(
      'Must specify an apiKey or clientSessionToken',
    )
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

  public readonly workspaces = {
    get: async (): Promise<{ workspace_id: string }> => {
      const {
        data: { workspace },
      } = await this.client.get('/workspaces/get')
      return workspace
    },
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
