import type { Axios } from 'axios'

import { createClient } from './client.js'
import {
  isSeamHttpOptionsWithApiKey,
  isSeamHttpOptionsWithClient,
  isSeamHttpOptionsWithClientSessionToken,
  SeamHttpInvalidOptionsError,
  type SeamHttpOptions,
  type SeamHttpOptionsWithApiKey,
  type SeamHttpOptionsWithClient,
  type SeamHttpOptionsWithClientSessionToken,
} from './options.js'
import { parseOptions } from './parse-options.js'
import {
  SeamHttpAccessCodes,
  SeamHttpAcs,
  SeamHttpActionAttempts,
  SeamHttpClientSessions,
  SeamHttpConnectedAccounts,
  SeamHttpConnectWebviews,
  SeamHttpDevices,
  SeamHttpEvents,
  SeamHttpLocks,
  SeamHttpNoiseSensors,
  SeamHttpThermostats,
  SeamHttpWebhooks,
  SeamHttpWorkspaces,
} from './routes/index.js'

export class SeamHttp {
  client: Axios

  constructor(apiKeyOrOptions: string | SeamHttpOptions = {}) {
    const options = parseOptions(apiKeyOrOptions)
    this.client = createClient(options)
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

  get accessCodes(): SeamHttpAccessCodes {
    return SeamHttpAccessCodes.fromClient(this.client)
  }

  get acs(): SeamHttpAcs {
    return SeamHttpAcs.fromClient(this.client)
  }

  get actionAttempts(): SeamHttpActionAttempts {
    return SeamHttpActionAttempts.fromClient(this.client)
  }

  get clientSessions(): SeamHttpClientSessions {
    return SeamHttpClientSessions.fromClient(this.client)
  }

  get connectedAccounts(): SeamHttpConnectedAccounts {
    return SeamHttpConnectedAccounts.fromClient(this.client)
  }

  get connectWebviews(): SeamHttpConnectWebviews {
    return SeamHttpConnectWebviews.fromClient(this.client)
  }

  get devices(): SeamHttpDevices {
    return SeamHttpDevices.fromClient(this.client)
  }

  get events(): SeamHttpEvents {
    return SeamHttpEvents.fromClient(this.client)
  }

  get locks(): SeamHttpLocks {
    return SeamHttpLocks.fromClient(this.client)
  }

  get noiseSensors(): SeamHttpNoiseSensors {
    return SeamHttpNoiseSensors.fromClient(this.client)
  }

  get thermostats(): SeamHttpThermostats {
    return SeamHttpThermostats.fromClient(this.client)
  }

  get webhooks(): SeamHttpWebhooks {
    return SeamHttpWebhooks.fromClient(this.client)
  }

  get workspaces(): SeamHttpWorkspaces {
    return SeamHttpWorkspaces.fromClient(this.client)
  }
}
