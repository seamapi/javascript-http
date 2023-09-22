import type { Axios } from 'axios'

import { createAxiosClient } from './axios.js'
import {
  InvalidSeamHttpOptionsError,
  isSeamHttpOptionsWithApiKey,
  isSeamHttpOptionsWithClientSessionToken,
  type SeamHttpOptions,
  type SeamHttpOptionsWithApiKey,
  type SeamHttpOptionsWithClientSessionToken,
} from './client-options.js'
import { LegacyWorkspacesHttp } from './legacy/workspaces.js'
import { parseOptions } from './parse-options.js'
import { WorkspacesHttp } from './routes/workspaces.js'

export class SeamHttp {
  client: Axios

  #legacy: boolean

  constructor(apiKeyOrOptions: string | SeamHttpOptions) {
    const options = parseOptions(apiKeyOrOptions)
    this.#legacy = options.enableLegacyMethodBehaivor
    this.client = createAxiosClient(options)
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

  get workspaces(): WorkspacesHttp {
    if (this.#legacy) return new LegacyWorkspacesHttp(this.client)
    return new WorkspacesHttp(this.client)
  }
}
