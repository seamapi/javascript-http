/*
 * Automatically generated by generate-routes.ts.
 * Do not edit this file or add other files to this directory.
 */

import type { RouteRequestBody, RouteResponse } from '@seamapi/types/connect'

import {
  getAuthHeadersForClientSessionToken,
  warnOnInsecureuserIdentifierKey,
} from 'lib/seam/connect/auth.js'
import { type Client, createClient } from 'lib/seam/connect/client.js'
import {
  isSeamHttpOptionsWithApiKey,
  isSeamHttpOptionsWithClient,
  isSeamHttpOptionsWithClientSessionToken,
  isSeamHttpOptionsWithConsoleSessionToken,
  isSeamHttpOptionsWithPersonalAccessToken,
  type SeamHttpFromPublishableKeyOptions,
  SeamHttpInvalidOptionsError,
  type SeamHttpOptions,
  type SeamHttpOptionsWithApiKey,
  type SeamHttpOptionsWithClient,
  type SeamHttpOptionsWithClientSessionToken,
  type SeamHttpOptionsWithConsoleSessionToken,
  type SeamHttpOptionsWithPersonalAccessToken,
  type SeamHttpRequestOptions,
} from 'lib/seam/connect/options.js'
import {
  limitToSeamHttpRequestOptions,
  parseOptions,
} from 'lib/seam/connect/parse-options.js'
import { SeamHttpRequest } from 'lib/seam/connect/seam-http-request.js'
import type { SetNonNullable } from 'lib/types.js'

import { SeamHttpClientSessions } from './client-sessions.js'

export class SeamHttpWebhooks {
  client: Client
  readonly defaults: Required<SeamHttpRequestOptions>

  constructor(apiKeyOrOptions: string | SeamHttpOptions = {}) {
    const options = parseOptions(apiKeyOrOptions)
    this.client = 'client' in options ? options.client : createClient(options)
    this.defaults = limitToSeamHttpRequestOptions(options)
  }

  static fromClient(
    client: SeamHttpOptionsWithClient['client'],
    options: Omit<SeamHttpOptionsWithClient, 'client'> = {},
  ): SeamHttpWebhooks {
    const constructorOptions = { ...options, client }
    if (!isSeamHttpOptionsWithClient(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing client')
    }
    return new SeamHttpWebhooks(constructorOptions)
  }

  static fromApiKey(
    apiKey: SeamHttpOptionsWithApiKey['apiKey'],
    options: Omit<SeamHttpOptionsWithApiKey, 'apiKey'> = {},
  ): SeamHttpWebhooks {
    const constructorOptions = { ...options, apiKey }
    if (!isSeamHttpOptionsWithApiKey(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing apiKey')
    }
    return new SeamHttpWebhooks(constructorOptions)
  }

  static fromClientSessionToken(
    clientSessionToken: SeamHttpOptionsWithClientSessionToken['clientSessionToken'],
    options: Omit<
      SeamHttpOptionsWithClientSessionToken,
      'clientSessionToken'
    > = {},
  ): SeamHttpWebhooks {
    const constructorOptions = { ...options, clientSessionToken }
    if (!isSeamHttpOptionsWithClientSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing clientSessionToken')
    }
    return new SeamHttpWebhooks(constructorOptions)
  }

  static async fromPublishableKey(
    publishableKey: string,
    userIdentifierKey: string,
    options: SeamHttpFromPublishableKeyOptions = {},
  ): Promise<SeamHttpWebhooks> {
    warnOnInsecureuserIdentifierKey(userIdentifierKey)
    const clientOptions = parseOptions({ ...options, publishableKey })
    if (isSeamHttpOptionsWithClient(clientOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'The client option cannot be used with SeamHttp.fromPublishableKey',
      )
    }
    const client = createClient(clientOptions)
    const clientSessions = SeamHttpClientSessions.fromClient(client)
    const { token } = await clientSessions.getOrCreate({
      user_identifier_key: userIdentifierKey,
    })
    return SeamHttpWebhooks.fromClientSessionToken(token, options)
  }

  static fromConsoleSessionToken(
    consoleSessionToken: SeamHttpOptionsWithConsoleSessionToken['consoleSessionToken'],
    workspaceId: SeamHttpOptionsWithConsoleSessionToken['workspaceId'],
    options: Omit<
      SeamHttpOptionsWithConsoleSessionToken,
      'consoleSessionToken' | 'workspaceId'
    > = {},
  ): SeamHttpWebhooks {
    const constructorOptions = { ...options, consoleSessionToken, workspaceId }
    if (!isSeamHttpOptionsWithConsoleSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing consoleSessionToken or workspaceId',
      )
    }
    return new SeamHttpWebhooks(constructorOptions)
  }

  static fromPersonalAccessToken(
    personalAccessToken: SeamHttpOptionsWithPersonalAccessToken['personalAccessToken'],
    workspaceId: SeamHttpOptionsWithPersonalAccessToken['workspaceId'],
    options: Omit<
      SeamHttpOptionsWithPersonalAccessToken,
      'personalAccessToken' | 'workspaceId'
    > = {},
  ): SeamHttpWebhooks {
    const constructorOptions = { ...options, personalAccessToken, workspaceId }
    if (!isSeamHttpOptionsWithPersonalAccessToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing personalAccessToken or workspaceId',
      )
    }
    return new SeamHttpWebhooks(constructorOptions)
  }

  async updateClientSessionToken(
    clientSessionToken: SeamHttpOptionsWithClientSessionToken['clientSessionToken'],
  ): Promise<void> {
    const { headers } = this.client.defaults
    const authHeaders = getAuthHeadersForClientSessionToken({
      clientSessionToken,
    })
    for (const key of Object.keys(authHeaders)) {
      if (headers[key] == null) {
        throw new Error(
          'Cannot update a clientSessionToken on a client created without a clientSessionToken',
        )
      }
    }
    this.client.defaults.headers = { ...headers, ...authHeaders }
    const clientSessions = SeamHttpClientSessions.fromClient(this.client)
    await clientSessions.get()
  }

  create(
    body?: WebhooksCreateBody,
  ): SeamHttpRequest<WebhooksCreateResponse, 'webhook'> {
    return new SeamHttpRequest(this, {
      path: '/webhooks/create',
      method: 'post',
      body,
      responseKey: 'webhook',
    })
  }

  delete(body?: WebhooksDeleteParams): SeamHttpRequest<void, undefined> {
    return new SeamHttpRequest(this, {
      path: '/webhooks/delete',
      method: 'post',
      body,
      responseKey: undefined,
    })
  }

  get(
    body?: WebhooksGetParams,
  ): SeamHttpRequest<WebhooksGetResponse, 'webhook'> {
    return new SeamHttpRequest(this, {
      path: '/webhooks/get',
      method: 'post',
      body,
      responseKey: 'webhook',
    })
  }

  list(
    body?: WebhooksListParams,
  ): SeamHttpRequest<WebhooksListResponse, 'webhooks'> {
    return new SeamHttpRequest(this, {
      path: '/webhooks/list',
      method: 'post',
      body,
      responseKey: 'webhooks',
    })
  }

  update(body?: WebhooksUpdateBody): SeamHttpRequest<void, undefined> {
    return new SeamHttpRequest(this, {
      path: '/webhooks/update',
      method: 'post',
      body,
      responseKey: undefined,
    })
  }
}

export type WebhooksCreateBody = RouteRequestBody<'/webhooks/create'>

export type WebhooksCreateResponse = SetNonNullable<
  Required<RouteResponse<'/webhooks/create'>>
>

export type WebhooksCreateOptions = never

export type WebhooksDeleteParams = RouteRequestBody<'/webhooks/delete'>

export type WebhooksDeleteResponse = SetNonNullable<
  Required<RouteResponse<'/webhooks/delete'>>
>

export type WebhooksDeleteOptions = never

export type WebhooksGetParams = RouteRequestBody<'/webhooks/get'>

export type WebhooksGetResponse = SetNonNullable<
  Required<RouteResponse<'/webhooks/get'>>
>

export type WebhooksGetOptions = never

export type WebhooksListParams = RouteRequestBody<'/webhooks/list'>

export type WebhooksListResponse = SetNonNullable<
  Required<RouteResponse<'/webhooks/list'>>
>

export type WebhooksListOptions = never

export type WebhooksUpdateBody = RouteRequestBody<'/webhooks/update'>

export type WebhooksUpdateResponse = SetNonNullable<
  Required<RouteResponse<'/webhooks/update'>>
>

export type WebhooksUpdateOptions = never
