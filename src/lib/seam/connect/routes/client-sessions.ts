/*
 * Automatically generated by generate-routes.ts.
 * Do not edit this file or add other files to this directory.
 */

import type { RouteRequestBody, RouteResponse } from '@seamapi/types/connect'
import type { SetNonNullable } from 'type-fest'

import { warnOnInsecureuserIdentifierKey } from 'lib/seam/connect/auth.js'
import { type Client, createClient } from 'lib/seam/connect/client.js'
import {
  isSeamHttpOptionsWithApiKey,
  isSeamHttpOptionsWithClient,
  isSeamHttpOptionsWithClientSessionToken,
  type SeamHttpFromPublishableKeyOptions,
  SeamHttpInvalidOptionsError,
  type SeamHttpOptions,
  type SeamHttpOptionsWithApiKey,
  type SeamHttpOptionsWithClient,
  type SeamHttpOptionsWithClientSessionToken,
} from 'lib/seam/connect/options.js'
import { parseOptions } from 'lib/seam/connect/parse-options.js'

export class SeamHttpClientSessions {
  client: Client

  constructor(apiKeyOrOptions: string | SeamHttpOptions = {}) {
    const clientOptions = parseOptions(apiKeyOrOptions)
    this.client = createClient(clientOptions)
  }

  static fromClient(
    client: SeamHttpOptionsWithClient['client'],
    options: Omit<SeamHttpOptionsWithClient, 'client'> = {},
  ): SeamHttpClientSessions {
    const constructorOptions = { ...options, client }
    if (!isSeamHttpOptionsWithClient(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing client')
    }
    return new SeamHttpClientSessions(constructorOptions)
  }

  static fromApiKey(
    apiKey: SeamHttpOptionsWithApiKey['apiKey'],
    options: Omit<SeamHttpOptionsWithApiKey, 'apiKey'> = {},
  ): SeamHttpClientSessions {
    const constructorOptions = { ...options, apiKey }
    if (!isSeamHttpOptionsWithApiKey(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing apiKey')
    }
    return new SeamHttpClientSessions(constructorOptions)
  }

  static fromClientSessionToken(
    clientSessionToken: SeamHttpOptionsWithClientSessionToken['clientSessionToken'],
    options: Omit<
      SeamHttpOptionsWithClientSessionToken,
      'clientSessionToken'
    > = {},
  ): SeamHttpClientSessions {
    const constructorOptions = { ...options, clientSessionToken }
    if (!isSeamHttpOptionsWithClientSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing clientSessionToken')
    }
    return new SeamHttpClientSessions(constructorOptions)
  }

  static async fromPublishableKey(
    publishableKey: string,
    userIdentifierKey: string,
    options: SeamHttpFromPublishableKeyOptions = {},
  ): Promise<SeamHttpClientSessions> {
    warnOnInsecureuserIdentifierKey(userIdentifierKey)
    const clientOptions = parseOptions({ ...options, publishableKey })
    const client = createClient(clientOptions)
    const clientSessions = SeamHttpClientSessions.fromClient(client)
    // TODO: clientSessions.getOrCreate({ user_identifier_key: userIdentifierKey })
    const { token } = await clientSessions.create({
      user_identifier_key: userIdentifierKey,
    })
    return SeamHttpClientSessions.fromClientSessionToken(token, options)
  }

  async create(
    body: ClientSessionsCreateBody,
  ): Promise<ClientSessionsCreateResponse['client_session']> {
    const { data } = await this.client.request<ClientSessionsCreateResponse>({
      url: '/client_sessions/create',
      method: 'post',
      data: body,
    })
    return data.client_session
  }

  async delete(body: ClientSessionsDeleteBody): Promise<void> {
    await this.client.request<ClientSessionsDeleteResponse>({
      url: '/client_sessions/delete',
      method: 'post',
      data: body,
    })
  }

  async get(
    body: ClientSessionsGetBody,
  ): Promise<ClientSessionsGetResponse['client_session']> {
    const { data } = await this.client.request<ClientSessionsGetResponse>({
      url: '/client_sessions/get',
      method: 'post',
      data: body,
    })
    return data.client_session
  }

  async grantAccess(
    body: ClientSessionsGrantAccessBody,
  ): Promise<ClientSessionsGrantAccessResponse['client_session']> {
    const { data } =
      await this.client.request<ClientSessionsGrantAccessResponse>({
        url: '/client_sessions/grant_access',
        method: 'post',
        data: body,
      })
    return data.client_session
  }

  async list(
    body: ClientSessionsListBody,
  ): Promise<ClientSessionsListResponse['client_sessions']> {
    const { data } = await this.client.request<ClientSessionsListResponse>({
      url: '/client_sessions/list',
      method: 'post',
      data: body,
    })
    return data.client_sessions
  }
}

export type ClientSessionsCreateBody =
  RouteRequestBody<'/client_sessions/create'>

export type ClientSessionsCreateResponse = SetNonNullable<
  Required<RouteResponse<'/client_sessions/create'>>
>

export type ClientSessionsDeleteBody =
  RouteRequestBody<'/client_sessions/delete'>

export type ClientSessionsDeleteResponse = SetNonNullable<
  Required<RouteResponse<'/client_sessions/delete'>>
>

export type ClientSessionsGetBody = RouteRequestBody<'/client_sessions/get'>

export type ClientSessionsGetResponse = SetNonNullable<
  Required<RouteResponse<'/client_sessions/get'>>
>

export type ClientSessionsGrantAccessBody =
  RouteRequestBody<'/client_sessions/grant_access'>

export type ClientSessionsGrantAccessResponse = SetNonNullable<
  Required<RouteResponse<'/client_sessions/grant_access'>>
>

export type ClientSessionsListBody = RouteRequestBody<'/client_sessions/list'>

export type ClientSessionsListResponse = SetNonNullable<
  Required<RouteResponse<'/client_sessions/list'>>
>
