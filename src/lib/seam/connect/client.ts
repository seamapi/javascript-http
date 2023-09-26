import type { Axios } from 'axios'

import { createAxiosClient } from './axios.js'
import {
  isSeamHttpOptionsWithApiKey,
  isSeamHttpOptionsWithClient,
  isSeamHttpOptionsWithClientSessionToken,
  SeamHttpInvalidOptionsError,
  type SeamHttpOptions,
  type SeamHttpOptionsWithApiKey,
  type SeamHttpOptionsWithClient,
  type SeamHttpOptionsWithClientSessionToken,
} from './client-options.js'
import { SeamHttpLegacyWorkspaces } from './legacy/workspaces.js'
import { parseOptions } from './parse-options.js'
import { SeamHttpWorkspaces } from './routes/workspaces.js'

export class SeamHttp {
  client: Axios

  #legacy: boolean

  constructor(apiKeyOrOptions: string | SeamHttpOptions) {
    const options = parseOptions(apiKeyOrOptions)
    this.#legacy = options.enableLegacyMethodBehaivor
    const client = 'client' in options ? options.client : null
    this.client = client ?? createAxiosClient(options)
  }

  static fromClient(
    client: SeamHttpOptionsWithClient['client'],
    options: Omit<SeamHttpOptionsWithClient, 'client'> = {},
  ): SeamHttp {
    const opts = { ...options, client }
    if (!isSeamHttpOptionsWithClient(opts)) {
      throw new SeamHttpInvalidOptionsError('Missing client')
    }
    return new SeamHttp(opts)
  }

  static fromApiKey(
    apiKey: SeamHttpOptionsWithApiKey['apiKey'],
    options: Omit<SeamHttpOptionsWithApiKey, 'apiKey'> = {},
  ): SeamHttp {
    const opts = { ...options, apiKey }
    if (!isSeamHttpOptionsWithApiKey(opts)) {
      throw new SeamHttpInvalidOptionsError('Missing apiKey')
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
      throw new SeamHttpInvalidOptionsError('Missing clientSessionToken')
    }
    return new SeamHttp(opts)
  }

  get workspaces(): SeamHttpWorkspaces {
    if (this.#legacy) return new SeamHttpLegacyWorkspaces(this.client)
    return new SeamHttpWorkspaces({ client: this.client })
  }
}

// TODO
// static fromPublishableKey and deprecate getClientSessionToken

// TODO: Should we keep makeRequest?
// Better to implement error handling and wrapping in an error handler.
// makeRequest
