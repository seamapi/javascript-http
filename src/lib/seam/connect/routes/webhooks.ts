/*
 * Automatically generated by generate-routes.ts.
 * Do not edit this file or add other files to this directory.
 */

import type {
  RouteRequestBody,
  RouteRequestParams,
  RouteResponse,
} from '@seamapi/types/connect'
import type { SetNonNullable } from 'type-fest'

import { warnOnInsecureuserIdentifierKey } from 'lib/seam/connect/auth.js'
import { type Client, createClient } from 'lib/seam/connect/client.js'
import {
  isSeamHttpOptionsWithApiKey,
  isSeamHttpOptionsWithClient,
  isSeamHttpOptionsWithClientSessionToken,
  isSeamHttpOptionsWithConsoleSessionToken,
  type SeamHttpFromPublishableKeyOptions,
  SeamHttpInvalidOptionsError,
  type SeamHttpOptions,
  type SeamHttpOptionsWithApiKey,
  type SeamHttpOptionsWithClient,
  type SeamHttpOptionsWithClientSessionToken,
} from 'lib/seam/connect/options.js'
import { parseOptions } from 'lib/seam/connect/parse-options.js'

import { SeamHttpClientSessions } from './client-sessions.js'

export class SeamHttpWebhooks {
  client: Client

  constructor(apiKeyOrOptions: string | SeamHttpOptions = {}) {
    const clientOptions = parseOptions(apiKeyOrOptions)
    this.client = createClient(clientOptions)
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

  async create(
    body?: WebhooksCreateBody,
  ): Promise<WebhooksCreateResponse['webhook']> {
    const { data } = await this.client.request<WebhooksCreateResponse>({
      url: '/webhooks/create',
      method: 'post',
      data: body,
    })
    return data.webhook
  }

  async delete(body?: WebhooksDeleteBody): Promise<void> {
    await this.client.request<WebhooksDeleteResponse>({
      url: '/webhooks/delete',
      method: 'post',
      data: body,
    })
  }

  async get(body?: WebhooksGetParams): Promise<WebhooksGetResponse['webhook']> {
    const { data } = await this.client.request<WebhooksGetResponse>({
      url: '/webhooks/get',
      method: 'post',
      data: body,
    })
    return data.webhook
  }

  async list(
    params?: WebhooksListParams,
  ): Promise<WebhooksListResponse['webhooks']> {
    const { data } = await this.client.request<WebhooksListResponse>({
      url: '/webhooks/list',
      method: 'get',
      params,
    })
    return data.webhooks
  }
}

export type WebhooksCreateBody = RouteRequestBody<'/webhooks/create'>

export type WebhooksCreateResponse = SetNonNullable<
  Required<RouteResponse<'/webhooks/create'>>
>

export type WebhooksDeleteBody = RouteRequestBody<'/webhooks/delete'>

export type WebhooksDeleteResponse = SetNonNullable<
  Required<RouteResponse<'/webhooks/delete'>>
>

export type WebhooksGetParams = RouteRequestBody<'/webhooks/get'>

export type WebhooksGetResponse = SetNonNullable<
  Required<RouteResponse<'/webhooks/get'>>
>

export type WebhooksListParams = RouteRequestParams<'/webhooks/list'>

export type WebhooksListResponse = SetNonNullable<
  Required<RouteResponse<'/webhooks/list'>>
>
